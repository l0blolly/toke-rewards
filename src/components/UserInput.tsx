import { Button, Grid, TextField } from "@mui/material";

type Props = {
  setAddress: (address: string) => void;
};

export function UserInput({ setAddress }: Props) {
  return (
    <form
      onSubmit={(event) => {
        setAddress(event.currentTarget["address"].value.toLowerCase().trim());
        event.preventDefault();
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
            defaultValue={process.env.REACT_APP_DEFAULT_ADDRESS || ""}
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
