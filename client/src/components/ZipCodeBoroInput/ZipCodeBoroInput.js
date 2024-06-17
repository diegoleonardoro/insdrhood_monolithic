import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import MuiButton from '@mui/material/Button';
import "./zipCodeBoroInput.css";
import axios from "axios";
import { complaintTypesArray } from '../../initialDataLoad/complaintTypes';
import { nycZipCodes } from "../../initialDataLoad/nyczipcodes"


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

export default function ZipCodeBoroSelect({ loadingLineChartonClick,  updateDayCountData }) {

  const theme = useTheme();
  const [selectedZipCodes, setSelectedZipCodes] = React.useState([]);
  const [selectedBoroughs, setSelectedBoroughs] = React.useState([]);
  const [selectedComplaints, setSelectedComplaints] = React.useState([]);

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

  const handleSelectedComplaints = (event) => {
    const {
      target: { value },
    } = event;

    setSelectedComplaints(
      typeof value === 'string' ? value.split(',') : value,
    );

  }

  const handleDelete = (zipToDelete) => {
    setSelectedZipCodes(currentZips => currentZips.filter(zip => zip !== zipToDelete));
  };

  const handleFilterSubmit = async (e) => {

    if (e) {
      e.preventDefault();
    }

    // here make request to tbe back to filter the data with the 
    const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls_complaint_types_count`, {
      params: {
        zipcodes: selectedZipCodes,
        boroughs: selectedBoroughs,
        complaint_types: selectedComplaints
      }
    });

    console.log("res", response)

    // include this response in updateDayCountData so that the setDayCountData state in the parent component is updated
    updateDayCountData(response.data)

  };

  return (

    <div>
      <div className='zipCodeBoroInputContainer'>

        <div className='boroSelectInput'  >
       
          <FormControl sx={{ m: 1, width: "95%" }}>
            <InputLabel id="demo-multiple-checkbox-label">Zip Codes</InputLabel>
            <Select
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              value={selectedZipCodes}
              onChange={handleChange}
              input={<OutlinedInput label="Zip Codes" />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={MenuProps}
            >
              {nycZipCodes.map((zip) => (
                <MenuItem key={zip} value={zip}>
                  <Checkbox checked={selectedZipCodes.indexOf(zip) > -1} />
                  <ListItemText primary={zip} />
                </MenuItem>
              ))}
            </Select>

          </FormControl>

        </div>

        <div className='boroSelectInput borocomplaint'>
          <FormControl sx={{ m: 1, width: "95%" }}>
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

        <div className='boroSelectInput borocomplaint'>
          <FormControl sx={{ m: 1, width: "95%" }}>
            <InputLabel id="demo-multiple-checkbox-label">Complaints</InputLabel>
            <Select
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              value={selectedComplaints}
              onChange={handleSelectedComplaints}
              input={<OutlinedInput label="Complaints" />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={MenuProps}

            >
              {complaintTypesArray.map((complaint) => (
                <MenuItem key={complaint} value={complaint}>
                  <Checkbox checked={selectedComplaints.indexOf(complaint) > -1} />
                  <ListItemText primary={complaint} />
                </MenuItem>
              ))}

            </Select>
          </FormControl>
        </div>


        <MuiButton className='buttonSubmitZipBoroSelect' sx={{
          color: "white", border: "1px solid rgba(0, 0, 0, 0.87)", backgroundColor: "black", backgroundColor: 'black',
          '&:hover': {
            backgroundColor: 'white',
            color: 'black',
            border: "1px solid rgba(0, 0, 0, 0.87)",
          },
          cursor: "pointer",
          fontSize: "10px"

        }} variant="outlined" onClick={() => { handleFilterSubmit(); loadingLineChartonClick ()}}>Apply Filters
        </MuiButton>

      </div>

    </div>
  );

}