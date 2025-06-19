import { ProgressLoader } from "@/components/ui/progress-loader";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto p-8">
        <ProgressLoader isLoading={true} />
      </div>
    </div>
  );
}
