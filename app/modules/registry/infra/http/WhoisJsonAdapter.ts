import { Domain } from "../../domain/Domain";
import { IRegistryPort } from "../../domain/IRegistryPort";
import { Registry } from "../../domain/Registry";
import { HttpClientPort } from "./http.client";

export class WhoisJsonAdapter implements IRegistryPort {
  constructor(
    private readonly http: HttpClientPort,
    private readonly API_KEY: string
  ) {}

  async searchByDomain(value: Domain): Promise<Registry | null> {
    const url = new URL("https://whoisjson.com/api/v1/whois");
    const domain = value.getValue;

    url.searchParams.set("domain", domain);

    const response = await this.http.get<WhoisJsonResponse>(url, {
      Authorization: `TOKEN=${this.API_KEY}`,
    });

    if (!response.ok) {
      console.error("Consulta con whoisjsonapi falló: " + response.message);
      return null;
    }

    const data = response.data;

    if (!data.created || !data.expires) {
      console.error(
        `Fechas críticas para${domain} no encontradas en la respuesta whoisjsonapi`
      );
      return null;
    }

    return new Registry({
      domain: new Domain(data.name ?? data.idnName),
      registryCreatedAt: new Date(data.created),
      registryExpiresAt: new Date(data.expires),
      registryUpdatedAt: data.changed
        ? new Date(data.changed)
        : data.lastUpdated
        ? new Date(data.lastUpdated)
        : null,
      origin: url.origin,
    });
  }
}

export interface WhoisJsonResponse {
  server: string;
  name: string;
  idnName: string;
  status: string[];
  nameserver: string[];
  ips: string;
  created: string;
  changed: string;
  expires: string;
  lastUpdated: string;
  registered: boolean;
  dnssec: string;
  whoisserver: string | null;
  contacts: Record<string, any>;
  registrar: Record<string, any>;
  parsedContacts: boolean;
  source: string;
}
