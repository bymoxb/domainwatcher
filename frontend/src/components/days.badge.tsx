import { Badge } from "@radix-ui/themes";

const DaysBadge = ({ days }: { days: number }) => {
  const text = days >= 0 ? `${days} days left` : `${Math.abs(days)} days ago`;

  const color = days <= 10 ? "red" : days <= 50 ? "yellow" : "blue";

  return (
    <Badge size="2" color={color}>
      {text}
    </Badge>
  );
};

export default DaysBadge;
