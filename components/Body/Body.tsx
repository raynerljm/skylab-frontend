import { FC, ReactElement } from "react";
import { Box, SxProps } from "@mui/system";
import { NAVBAR_HEIGHT_REM } from "@/styles/constants";
import LoadingWrapper from "../wrapper/LoadingWrapper";

type Props = {
  children: ReactElement;
  flexColCenter?: boolean;
  isLoading?: boolean;
  loadingText?: string;
};

const Body: FC<Props> = ({
  children,
  flexColCenter,
  isLoading,
  loadingText,
}) => {
  const boxSx: SxProps = {
    minHeight: "100vh",
    height: "100%",
    paddingTop: NAVBAR_HEIGHT_REM,
    paddingX: "1rem",
  };

  if (flexColCenter) {
    boxSx.display = "flex";
    boxSx.flexDirection = "column";
    boxSx.justifyContent = "center";
    boxSx.alignItems = "center";
  }

  return (
    <>
      <Box sx={boxSx}>
        <LoadingWrapper isLoading={!!isLoading} loadingText={loadingText}>
          {children}
        </LoadingWrapper>
      </Box>
    </>
  );
};
export default Body;
