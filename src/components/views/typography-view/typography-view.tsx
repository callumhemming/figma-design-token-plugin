import { EditWindowType } from "../../features/edit-window";
import { Layout } from "../../features/layout";
import { TypographyScale } from "../../features/typography-scale";

type TypographyViewProps = {
  editWindowType?: EditWindowType;
};

export const TypographyView = ({ editWindowType }: TypographyViewProps) => {
  return (
    <Layout editWindowType={editWindowType}>
      <TypographyScale />
    </Layout>
  );
};
