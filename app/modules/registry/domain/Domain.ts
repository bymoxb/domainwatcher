import { InvalidDomainException } from "./exception/InvalidDomainException";

export class Domain {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValidSingleLevelDomain(value)) {
      throw new InvalidDomainException(value);
    }

    this.value = value.toLowerCase();
  }

  public get getValue(): string {
    return this.value;
  }

  private isValidSingleLevelDomain(domain: string): boolean {
    const regex = /^[a-zA-Z0-9-]{1,63}\.[a-zA-Z]{2,}$/;
    return regex.test(domain);
  }
}
