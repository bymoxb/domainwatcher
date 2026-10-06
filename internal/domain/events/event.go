package events

type Topic string

const (
	TopicRegistryChanged Topic = "registry.changed"
	TopicNotification    Topic = "notification"
)

type Broker interface {
	Subscribe(topics ...Topic) (<-chan Event, func())
	Publish(event Event)
}

type Event struct {
	Topic   Topic
	Content any
}
