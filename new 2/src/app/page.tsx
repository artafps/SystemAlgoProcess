import React from "react";

import {
    Heading,
    Flex,
    Text,
    Button,
    Avatar,
    RevealFx,
    Column,
    Badge,
    Row,
    TiltFx,
    Background, Card, Icon
} from "@/once-ui/components";
import { Projects } from "@/components/work/Projects";

import { baseURL, routes } from "@/app/resources";
import { home, about, person, newsletter } from "@/app/resources/content";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import {CodeBlock, Meta, Schema} from "@/once-ui/modules";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
  });
}

export default function Home() {

    const nonPreemptiveLinks = [
        {
            href: "/algorithms/fcfs",
            title: "FCFS (اولین ورود، اولین خدمت)",
            description: "شبیه‌سازی الگوریتم FCFS با نمایش جدول و نمودار گانت",
        },
        {
            href: "/algorithms/spn",
            title: "SPN (کوتاه‌ترین فرایند بعدی)",
            description: "شبیه‌سازی SPN برای درک بهتر زمان‌های اجرا",
        },
        {
            href: "/algorithms/hrrn",
            title: "HRRN (بالاترین نسبت پاسخ به خدمت)",
            description: "شبیه‌سازی و تحلیل دقیق الگوریتم HRRN",
        },
    ];
    const preemptiveLinks = [
        {
            href: "/algorithms/rr",
            title: "RR (راند رابین)",
            description: "شبیه‌سازی الگوریتم RR با کوانتوم زمانی دلخواه",
        },
        {
            href: "/algorithms/srtf",
            title: "SRTF (کوتاه‌ترین زمان باقی‌مانده اول)",
            description: "تحلیل و اجرای الگوریتم SRTF برای فرآیندهای پویا",
        },
    ];


    return (
    <Column maxWidth="m" gap="xl" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`${baseURL}/og?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <Column fillWidth paddingY="24" gap="m">
        <Column maxWidth="s">
          {home.featured && (
          <RevealFx fillWidth horizontal="start" paddingTop="16" paddingBottom="32" paddingLeft="12">
            <Badge background="brand-alpha-weak" paddingX="12" paddingY="4" onBackground="neutral-strong" textVariant="label-default-s" arrow={false}
              href={home.featured.href}>
              <Row paddingY="2">{home.featured.title}</Row>
            </Badge>
          </RevealFx>
          )}
          <RevealFx translateY="4" fillWidth horizontal="start" paddingBottom="16">
            <Heading wrap="balance" variant="display-strong-l">
              {home.headline}
            </Heading>
          </RevealFx>
          <RevealFx translateY="8" delay={0.2} fillWidth horizontal="start" paddingBottom="32">
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {home.subline}
            </Text>
          </RevealFx>
          <RevealFx paddingTop="12" delay={0.4} horizontal="start" paddingLeft="12">
            <Button
              dir={'ltr'}
              id="about"
              data-border="rounded"
              href={"https://artafps.ir"}
              variant="secondary"
              size="m"
              arrowIcon
            >
              <Flex gap="8" vertical="center">
                {about.avatar.display && (
                  <Avatar
                    style={{ marginLeft: "-0.75rem", marginRight: "0.25rem" }}
                    src={person.avatar}
                    size="m"
                  />
                )}
                     Power By : ARTAFPS
              </Flex>
            </Button>
          </RevealFx>
        </Column>
      </Column>
        <Row fillWidth overflow="hidden">
        <Row maxWidth="32" borderTop="neutral-alpha-weak" borderBottom="neutral-medium" />
        <Row fillWidth border="neutral-alpha-weak" mobileDirection="column">
            {preemptiveLinks.map((link, index) => (
                <Card
                    key={link.href}
                    fillWidth
                    href={link.href}
                    padding="40"
                    gap="8"
                    background="page"
                    direction="column"
                    borderRight={index < link.length - 1 ? "neutral-alpha-weak" : undefined}
                    border={undefined}
                >
                    <Row fillWidth center gap="12">
                        <Text variant="body-strong-m" onBackground="neutral-strong">
                            {link.title}
                        </Text>
                        <Icon size="s" name="arrowUpRight" />
                    </Row>
                    <Text align="center" variant="body-default-s" onBackground="neutral-weak">
                        {link.description}
                    </Text>
                </Card>
            ))}
        </Row>
        <Row maxWidth="32" borderTop="neutral-alpha-weak" borderBottom="neutral-medium" />
    </Row>
        <Row fillWidth overflow="hidden">
            <Row maxWidth="32" borderTop="neutral-alpha-weak" borderBottom="neutral-medium" />
            <Row fillWidth border="neutral-alpha-weak" mobileDirection="column">
                {nonPreemptiveLinks.map((link, index) => (
                    <Card
                        key={link.href}
                        fillWidth
                        href={link.href}
                        padding="40"
                        gap="8"
                        background="page"
                        direction="column"
                        borderRight={index < link.length - 1 ? "neutral-alpha-weak" : undefined}
                        border={undefined}
                    >
                        <Row fillWidth center gap="12">
                            <Text variant="body-strong-m" onBackground="neutral-strong">
                                {link.title}
                            </Text>
                            <Icon size="s" name="arrowUpRight" />
                        </Row>
                        <Text align="center" variant="body-default-s" onBackground="neutral-weak">
                            {link.description}
                        </Text>
                    </Card>
                ))}
            </Row>
            <Row maxWidth="32" borderTop="neutral-alpha-weak" borderBottom="neutral-medium" />
        </Row>


        <TiltFx fillWidth paddingX="32" paddingTop="64">
            <Column
                border="neutral-alpha-weak"
                paddingX="32"
                radius="xl"
                overflow="hidden"
                paddingY="160"
                fillWidth
                position="relative"
            >
                <Background
                    mask={{
                        x: 100,
                        y: 0,
                    }}
                    position="absolute"
                    grid={{
                        display: true,
                        color: "neutral-alpha-medium",
                        width: "2rem",
                        height: "2rem",
                    }}
                />
                <Background
                    mask={{
                        x: 0,
                        y: 100,
                        radius: 100,
                    }}
                    position="absolute"
                    grid={{
                        display: true,
                        color: "brand-alpha-strong",
                        width: "12",
                        height: "12",
                    }}
                    gradient={{
                        display: true,
                        opacity: 100,
                        height: 100,
                        width: 100,
                        tilt: 0,
                        x: 0,
                        y: 100,
                        colorStart: "brand-solid-strong",
                        colorEnd: "brand-background-medium",
                    }}
                />
                <Column horizontal="center" gap="48" fillWidth position="relative">
                    <Heading align="center" as="h2" variant="display-default-l">
                        به من کمک کنید این پروژه را توسعه بدهیم
                    </Heading>
                    <CodeBlock
                        dir={'ltr'}
                        compact
                        maxWidth={40}
                        codeInstances={[
                            {
                                code: "git clone https://github.com/artafps/SystemAlgoProcess.git",
                                language: "tsx",
                                label: "tsx",
                            },
                        ]}
                    />
                </Column>
            </Column>
        </TiltFx>
    </Column>
  );
}
