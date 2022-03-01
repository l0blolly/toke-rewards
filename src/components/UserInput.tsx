import { Button, TextField } from "@mui/material";

type Props = {
  setAddress: (address: string) => void;
};

export function UserInput({ setAddress }: Props) {
  return (
    <form
      onSubmit={(event) => {
        setAddress(event.currentTarget["address"].value);
        event.preventDefault();
      }}
      style={{ display: "flex", gap: "15px", justifyContent: "center" }}
    >
      <TextField
        label="Address"
        type="text"
        name="address"
        autoFocus={true}
        defaultValue={process.env.REACT_APP_DEFAULT_ADDRESS || ""}
        variant="standard"
        style={{ minWidth: "375px" }}
      />
      <Button type="submit" variant="contained">
        Query
      </Button>
    </form>
  );
}
