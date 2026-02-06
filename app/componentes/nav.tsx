import classNames from "classnames";
import Link from "next/link";

const LINKS = [
  {
    path: "/",
    text: "Home"
  },
  {
    path: "/my-domains",
    text: "My domains"
  },
]

export default function Nav() {
  return (
    <nav className="my-6 flex gap-4">
      <span className="font-bold text-xl flex-1">
        <Link href="/">DomainWatcher</Link>
      </span>
      {LINKS.map(item => (<Link
        key={item.path}
        href={item.path}
        className={classNames("underline")}
      >{item.text}</Link>))
      }
    </nav >
  )
}