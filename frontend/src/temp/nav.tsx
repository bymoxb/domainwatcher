"use client";

import { Heading, Link } from "@radix-ui/themes";
import LinkNextjs from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  {
    path: "/",
    text: "Search Domain",
  },
  {
    path: "/my-domains",
    text: "My Domains",
  },
];

export default function Nav() {
  return (
    <nav className="my-6 flex gap-4 items-center">
      <Heading size="6" weight="bold">
        <LinkNextjs href="/">DomainWatcher</LinkNextjs>
      </Heading>
      <div className="flex-1"></div>
      <Suspense>
        <NavLinks />
      </Suspense>
    </nav>
  );
}

const NavLinks = () => {
  const params = useSearchParams();

  return (
    <>
      {LINKS.map((item) => (
        <Link key={item.path} asChild>
          <LinkNextjs
            href={{
              pathname: item.path,
              query: params.toString(),
            }}
          >
            {item.text}
          </LinkNextjs>
        </Link>
      ))}
    </>
  );
};
