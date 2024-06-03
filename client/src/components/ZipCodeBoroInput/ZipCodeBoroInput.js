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
import MuiButton from '@mui/material/Button';
import "./zipCodeBoroInput.css";
import axios from "axios";
import { complaintTypesArray } from '../../initialDataLoad/complaintTypes';



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

const nycZipCodes = [
  "10001", "10002", "10003", "10004", "10005", "10006", "10007", "10009", "10010", "10011",
  "10012", "10013", "10014", "10015", "10016", "10017", "10018", "10019", "10020", "10021", "10022",
  "10023", "10024", "10025", "10026", "10027", "10028", "10029", "10030", "10031", "10032",
  "10033", "10034", "10035", "10036", "10037", "10038", "10039", "10040", "10041", "10044",
  "10045", "10048", "10055", "10060", "10069", "10090", "10095", "10098", "10099", "10103",
  "10104", "10105", "10106", "10107", "10110", "10111", "10112", "10115", "10118", "10119",
  "10120", "10121", "10122", "10123", "10128", "10151", "10152", "10153", "10154", "10155",
  "10158", "10161", "10162", "10165", "10166", "10167", "10168", "10169", "10170", "10171",
  "10172", "10173", "10174", "10175", "10176", "10177", "10178", "10199", "10270", "10271",
  "10278", "10279", "10280", "10281", "10282", "10301", "10302", "10303", "10304", "10305",
  "10306", "10307", "10308", "10309", "10310", "10311", "10312", "10314", "10451", "10452",
  "10453", "10454", "10455", "10456", "10457", "10458", "10459", "10460", "10461", "10462",
  "10463", "10464", "10465", "10466", "10467", "10468", "10469", "10470", "10471", "10472",
  "10473", "10474", "10475", "11004", "11005", "11101", "11102", "11103", "11104", "11105",
  "11106", "11109", "11201", "11203", "11204", "11205", "11206", "11207", "11208", "11209",
  "11210", "11211", "11212", "11213", "11214", "11215", "11216", "11217", "11218", "11219",
  "11220", "11221", "11222", "11223", "11224", "11225", "11226", "11228", "11229", "11230",
  "11231", "11232", "11233", "11234", "11235", "11236", "11237", "11238", "11239", "11241",
  "11242", "11243", "11249", "11252", "11256", "11351", "11352", "11354", "11355", "11356",
  "11357", "11358", "11359", "11360", "11361", "11362", "11363", "11364", "11365", "11366",
  "11367", "11368", "11369", "11370", "11371", "11372", "11373", "11374", "11375", "11377",
  "11378", "11379", "11385", "11411", "11412", "11413", "11414", "11415", "11416", "11417",
  "11418", "11419", "11420", "11421", "11422", "11423", "11424", "11425", "11426", "11427",
  "11428", "11429", "11430", "11432", "11433", "11434", "11435", "11436", "11691", "11692",
  "11693", "11694", "11695", "11697"
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