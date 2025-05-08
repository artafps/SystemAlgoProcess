import { Flex } from "@/once-ui/components";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import { baseURL } from "@/app/resources";
import {chart, person} from "@/app/resources/content";
import { Meta, Schema } from "@/once-ui/modules";

export async function generateMetadata() {
  return Meta.generate({
    title: chart.title,
    description: chart.description,
    baseURL: baseURL,
    image: `${baseURL}/og?title=${encodeURIComponent(chart.title)}`,
    path: chart.path,
  });
}

export default function Chart() {
  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={chart.title}
        description={chart.description}
        path={chart.path}
        image={`${baseURL}/og?title=${encodeURIComponent(chart.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${chart.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

    </Flex>
  );
}
