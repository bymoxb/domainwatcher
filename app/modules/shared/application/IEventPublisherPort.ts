import { RegistryRetrievedEvent } from '../../registry/domain/RegistryRetrievedEvent';

export interface IEventPublisherPort {
  publish(event: unknown): Promise<void>;
}
