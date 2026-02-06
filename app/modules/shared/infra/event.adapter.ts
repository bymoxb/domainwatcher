import { IEventPublisherPort } from "../application/IEventPublisherPort";

class EventPublisherAdapter implements IEventPublisherPort {
  constructor() {}

  async publish(event: unknown): Promise<void> {
    
  }
}

const eventAdapter = new EventPublisherAdapter();

export default eventAdapter;
