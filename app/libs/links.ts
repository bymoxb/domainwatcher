export function buildWhoisLink(domain: string) {
  return `https://who.is/whois/${domain}`;
}

export function buildRdapLink(domain: string): string {
  return `https://client.rdap.org/?type=domain&object=${domain}`;
}
