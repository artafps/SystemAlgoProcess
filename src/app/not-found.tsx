import { Column, Heading, Text } from "@/once-ui/components";

export default function NotFound() {
  return (
      <Column as="section" fill center paddingBottom="160">
          <Text marginBottom="s" variant="display-strong-xl">
              ۴۰۴
          </Text>
          <Heading marginBottom="l" variant="display-default-xs">
              صفحه پیدا نشد
          </Heading>
          <Text onBackground="neutral-weak">
              صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
          </Text>
      </Column>

  );
}
