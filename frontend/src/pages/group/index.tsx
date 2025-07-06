import { CreateGroupForm } from "@/components/group";
import React from "react";

export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}

const Group: React.FC<{
  open: boolean;
  setOpen: (value: boolean) => void;
}> = ({ open, setOpen }) => {
  return <CreateGroupForm open={open} setOpen={setOpen} />;
};

export default Group;
