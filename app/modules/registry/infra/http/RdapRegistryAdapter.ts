import { IRegistryPort } from "../../domain/IRegistryPort";
import { Registry } from "../../domain/Registry";

export class RdapRegistryAdapter implements IRegistryPort {
  public async searchByDomain(domain: string): Promise<Registry | null> {
    try {
      const url = new URL('https://rdap.org/domain/:domain');

      console.log(`Fetching "${domain}" from "${url.host}"`);

      url.pathname = url.pathname.replace(':domain', domain);
      const raw = await fetch(url);

      if (!raw.ok) {
        console.error('consulta con rdap fallo');
        console.error(raw.status);
        return null;
      }

      const { events = [], ...object }: RDAPResponse = await raw.json();

      const registration = events.find((e) => e.eventAction === 'registration')?.eventDate;
      const expiration = events.find((e) => e.eventAction === 'expiration')?.eventDate;
      const changed = events.find((e) => e.eventAction === 'last changed')?.eventDate;

      if (!registration) {
        throw new Error("registration not found");
      }

      if (!expiration) {
        throw new Error("expiration not found");
      }

      return new Registry({
        domain: object.unicodeName ?? object.ldhName,
        registryCreatedAt: new Date(registration),
        registryExpiresAt: new Date(expiration),
        registryUpdatedAt: changed ? new Date(changed) : null,
        origin: url.origin,
      });
    } catch (error) {
      console.error(`Error al obtener (${domain}) informacion: ${error}`);
      return null;
    }
  }
}

interface Link {
  value: string;
  rel: string;
  href: string;
  type: string;
}

interface PublicId {
  type: string;
  identifier: string;
}

interface VCard {
  version: string;
  fn: string;
  tel?: {
    type: string;
    uri: string;
  };
  email?: {
    type: string;
    text: string;
  };
}

interface Entity {
  objectClassName: string;
  handle: string;
  roles: string[];
  links: Link[];
  publicIds?: PublicId[];
  vcardArray: [string, [Array<string | object>][]]; // Array que contiene vCard info
  entities?: Entity[]; // Subentidades dentro de una entidad
}

interface Event {
  eventAction: string;
  eventDate: string;
}

interface Nameserver {
  objectClassName: string;
  ldhName: string;
}

interface Notice {
  title: string;
  description: string[];
  links: Link[];
}

interface SecureDNS {
  delegationSigned: boolean;
}

interface RDAPResponse {
  objectClassName: string;
  handle: string;
  ldhName: string;
  unicodeName: string;
  links: Link[];
  status: string[];
  entities: Entity[];
  events: Event[];
  secureDNS: SecureDNS;
  nameservers: Nameserver[];
  rdapConformance: string[];
  notices: Notice[];
}
