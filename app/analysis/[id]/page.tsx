import { Metadata, ResolvingMetadata } from "next";
import { getAnalysisById } from "@/lib/analysisService";
import AnalysisClient from "./AnalysisClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  const analysis = await getAnalysisById(id);

  if (!analysis) {
    return {
      title: "Analysis Not Found - Debugly",
    };
  }

  return {
    title: `${analysis.title} | Debugly Analysis`,
    description: `AI-powered resolution for ${analysis.framework} error: ${analysis.whatBroke.slice(0, 100)}...`,
  };
}

export default async function SingleAnalysisPage({ params }: Props) {
  const id = (await params).id;
  
  return <AnalysisClient id={id} />;
}
