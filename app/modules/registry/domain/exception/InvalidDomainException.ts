import { DomainException } from "@/modules/shared/domain/DomainException";

export class InvalidDomainException extends DomainException {
  constructor(value: string) {
    super(
      "Domain (:value) must have exactly one part before the TLD and only contain letters, numbers, or hyphens.".replace(
        ":value",
        value
      )
    );
  }
}
