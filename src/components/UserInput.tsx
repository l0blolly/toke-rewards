type Props = {
  setAddress: (address: string) => void;
};

export function UserInput({ setAddress }: Props) {
  return (
    <div>
      <form
        onSubmit={(event) => {
          setAddress(event.currentTarget["address"].value);
          event.preventDefault();
        }}
      >
        <input
          type="text"
          name="address"
          autoFocus={true}
          defaultValue={process.env.REACT_APP_DEFAULT_ADDRESS || ""}
        />
        <button type="submit">query</button>
      </form>
    </div>
  );
}
