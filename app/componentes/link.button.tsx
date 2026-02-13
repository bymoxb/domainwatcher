export default function LinkButton({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <a
      className="inline-flex flex-1 items-center justify-center cursor-pointer hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      {text}
      <svg
        className="w-4 h-4 ms-2"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"
        />
      </svg>
    </a>
  );
}
