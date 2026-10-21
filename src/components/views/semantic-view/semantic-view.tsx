import { EditWindowType } from "../../features/edit-window";
import { Layout } from "../../features/layout";

type SemanticViewProps = {
  editWindowType?: EditWindowType;
};

export const SemanticView = ({ editWindowType }: SemanticViewProps) => {
  return <Layout editWindowType={editWindowType}>{null}</Layout>;
};
