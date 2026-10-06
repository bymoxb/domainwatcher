package events

import (
	"sync"

	domainevents "github.com/bymoxb/domainwatcher/internal/domain/events"
)

const defaultBufferSize = 10

type EventDispatcher struct {
	mu          sync.RWMutex
	subscribers map[*subscription]struct{}
}

type subscription struct {
	mu     sync.Mutex
	topics map[domainevents.Topic]struct{}
	ch     chan domainevents.Event
	closed bool
}

func NewEventDispatcher() *EventDispatcher {
	return &EventDispatcher{
		subscribers: make(map[*subscription]struct{}),
	}
}

func (ed *EventDispatcher) Subscribe(topics ...domainevents.Topic) (<-chan domainevents.Event, func()) {

	sub := &subscription{
		topics: make(map[domainevents.Topic]struct{}, len(topics)),
		ch:     make(chan domainevents.Event, defaultBufferSize),
	}

	for _, topic := range topics {
		sub.topics[topic] = struct{}{}
	}

	ed.mu.Lock()
	ed.subscribers[sub] = struct{}{}
	ed.mu.Unlock()

	unsubscribe := func() {
		ed.unsubscribe(sub)
	}

	return sub.ch, unsubscribe
}

func (ed *EventDispatcher) unsubscribe(sub *subscription) {
	ed.mu.Lock()

	if _, exists := ed.subscribers[sub]; !exists {
		ed.mu.Unlock()
		return
	}

	delete(ed.subscribers, sub)

	ed.mu.Unlock()

	sub.mu.Lock()
	defer sub.mu.Unlock()

	if sub.closed {
		return
	}

	sub.closed = true
	close(sub.ch)
}

func (ed *EventDispatcher) Publish(event domainevents.Event) {
	ed.mu.RLock()

	subscribers := make([]*subscription, 0, len(ed.subscribers))

	for sub := range ed.subscribers {
		subscribers = append(subscribers, sub)
	}

	ed.mu.RUnlock()

	for _, sub := range subscribers {
		sub.publish(event)
	}
}

func (sub *subscription) publish(event domainevents.Event) {
	if _, ok := sub.topics[event.Topic]; !ok {
		return
	}

	sub.mu.Lock()
	defer sub.mu.Unlock()

	if sub.closed {
		return
	}

	sub.ch <- event
}
