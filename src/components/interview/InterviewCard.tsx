import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterviewCardProps } from "@/types/interview";

const InterviewCard = ({
  interviewId,
  
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  // Format the date to show relative time (e.g., "2 days ago")
  const formattedDate = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "Unknown date";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="font-semibold text-lg">{role}</div>
        <Badge variant="outline" className="capitalize">
          {type}
        </Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-4">
          {techstack.map((tech) => (
            <Badge key={tech} variant="secondary" className="capitalize">
              {tech}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </CardContent>
      <CardFooter className="pt-2">
        {interviewId ? (
          <Button asChild className="w-full">
            <Link href={`/interview/${interviewId}`}>View Details</Link>
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link href="/interview">Start Interview</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
