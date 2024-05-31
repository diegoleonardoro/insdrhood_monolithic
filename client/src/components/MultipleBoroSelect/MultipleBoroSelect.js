import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// List of NYC boroughs
const boroughs = [
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island'
];

export default function BoroughSelect() {
  const [selectedBoroughs, setSelectedBoroughs] = React.useState([]);

  const handleChange_ = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedBoroughs(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-checkbox-label">Boroughs</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedBoroughs}
          onChange={handleChange_}
          input={<OutlinedInput label="Boroughs" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {boroughs.map((borough) => (
            <MenuItem key={borough} value={borough}>
              <Checkbox checked={selectedBoroughs.indexOf(borough) > -1} />
              <ListItemText primary={borough} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}