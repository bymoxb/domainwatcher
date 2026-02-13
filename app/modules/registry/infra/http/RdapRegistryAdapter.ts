import { Domain } from "../../domain/Domain";
import { IRegistryPort } from "../../domain/IRegistryPort";
import { Registry } from "../../domain/Registry";
import { HttpClientPort } from "./http.client";

export class RdapRegistryAdapter implements IRegistryPort {
  constructor(private readonly http: HttpClientPort) {}

  public async searchByDomain(value: Domain): Promise<Registry | null> {
    const domain = value.getValue;

    const url = new URL(`https://rdap.org/domain/${domain}`);

    console.log(`Fetching "${domain}" from "${url.host}"`);

    const response = await this.http.get<RDAPResponse>(url);

    if (!response.ok) {
      console.error("Consulta con RDAP falló: " + response.message);
      return null;
    }

    const { events = [], ...object } = response.data;

    const registration = events.find(
      (e) => e.eventAction === "registration"
    )?.eventDate;

    const expiration = events.find(
      (e) => e.eventAction === "expiration"
    )?.eventDate;

    const changed = events.find(
      (e) => e.eventAction === "last changed"
    )?.eventDate;

    if (!registration || !expiration) {
      console.error(
        `Fechas críticas para${domain} no encontradas en la respuesta RDAP`
      );
      return null;
    }

    return new Registry({
      domain: new Domain(object.unicodeName ?? object.ldhName),
      registryCreatedAt: new Date(registration),
      registryExpiresAt: new Date(expiration),
      registryUpdatedAt: changed ? new Date(changed) : null,
      origin: url.origin,
    });
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
