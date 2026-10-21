import { EditWindowType } from "../../features/edit-window";
import { Layout } from "../../features/layout";
import { Scales } from "../../features/scales";

type PrimitivesViewProps = {
  editWindowType?: EditWindowType;
};

export const PrimitivesView = ({ editWindowType }: PrimitivesViewProps) => {
  return (
    <Layout editWindowType={editWindowType}>
      <Scales />
    </Layout>
  );
};
