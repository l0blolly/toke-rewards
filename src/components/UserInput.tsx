import { Button, Grid, TextField } from "@mui/material";
import { getAddress } from "ethers/lib/utils";

type Props = {
  setAddress: (address: string) => void;
};

export function UserInput({ setAddress }: Props) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const value = event.currentTarget["address"].value.trim();
        try {
          setAddress(getAddress(value).toLowerCase());
        } catch {
          alert("invalid eth address");
        }
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
      >
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Address"
            typeof="text"
            name="address"
            autoFocus={true}
            defaultValue={import.meta.env.VITE_DEFAULT_ADDRESS || ""}
          />
        </Grid>
        <Grid item xs={12} sm={1}>
          <Button type="submit" variant="contained" fullWidth>
            Query
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
