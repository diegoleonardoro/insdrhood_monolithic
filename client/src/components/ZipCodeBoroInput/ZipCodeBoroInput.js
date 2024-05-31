import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';

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

const zipCodes = [
  '10001', '10002', '10003', '10004', '10005',
  '10006', '10007', '10009', '10010', '10011'
];

const boroughs = [
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island'
];

function getStyles(name, selectedZipCodes, theme) {
  return {
    fontWeight:
      selectedZipCodes.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function ZipCodeBoroSelect() {

  const theme = useTheme();
  const [selectedZipCodes, setSelectedZipCodes] = React.useState([]);
  const [selectedBoroughs, setSelectedBoroughs] = React.useState([]);


  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedZipCodes(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
    setSelectedBoroughs([]);
  };

  const handleChange_ = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedBoroughs(
      typeof value === 'string' ? value.split(',') : value,
    );

    setSelectedZipCodes([]);
  };

  const handleDelete = (zipToDelete) => {
    setSelectedZipCodes(currentZips => currentZips.filter(zip => zip !== zipToDelete));
  };

  return (

    <>
      <div >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, marginBottom: 2 }}>
          {selectedZipCodes.map(zip => (
            <Chip
              key={zip}
              label={zip}
              onDelete={() => handleDelete(zip)}
            />
          ))}
        </Box>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="demo-multiple-chip-label">Zip Codes</InputLabel>
          <Select
            labelId="demo-multiple-chip-label"
            id="demo-multiple-chip"
            multiple
            value={selectedZipCodes}
            renderValue={() => "Select Zip Codes:"}
            onChange={handleChange}
            input={<OutlinedInput id="select-multiple-chip" label="Zip Codes" />}
            MenuProps={MenuProps}
          >
            {zipCodes.map((zip) => (
              <MenuItem
                key={zip}
                value={zip}
                style={{
                  fontWeight:
                    selectedZipCodes.indexOf(zip) === -1
                      ? theme.typography.fontWeightRegular
                      : theme.typography.fontWeightMedium,
                }}
              >
                {zip}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
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

    </>
  );

}