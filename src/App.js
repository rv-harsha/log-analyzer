import React, { Component } from "react";
import {
  MDBNavbar,
  MDBContainer,
  MDBNavbarBrand,
  MDBBtn,
  MDBModal,
  MDBModalBody,
  MDBModalHeader,
  MDBModalFooter,
  MDBInput
} from "mdbreact";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
/*import Modal from "./components/Modal/Modal";*/

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";

import Table from "./components/DataTable/DataTable.js";
import TextField from "@material-ui/core/TextField";

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

import "./assets/styles/css/custom/0.0.1/style.min.css";

import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import VerticalLinearStepper from "./components/Modal/Stepper/Stepper";
import Textarea from "./components/TextArea/TextArea.js";

const useStyles = makeStyles({
  root: {
    display: "flex"
  }
});

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

class App extends Component {
  static propTypes = {
    classes: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.searchHandler = this.searchHandler.bind(this);
    this.textareaHandler = this.textareaHandler.bind(this);
    this.state = {
      server: {},
      quickSearch: false,
      searchString: "1s7f4vj3ks9f3k",
      checked: false,
      rows: null,
      canLoadTable: false,
      modal: false,
      responseText: null,
      error: null,
      isLoaded: false,
      server: {
        url: "http://localhost:3050",
        timeout: 100000,
        process: {
          url: "/upload",
          method: "POST",
          withCredentials: false,
          onload: response => {
            this.setState({
              rows: response,
              canLoadTable: true
            });
          },
          onerror: response => {
            console.log(response.data);
          }
        }
      }
    };
  }

  searchHandler(val) {
    var source = "";
    val.servers.forEach(function(server) {
      source = source + "&source=" + server;
    });
    console.log("SERVERS FOR SEARCH"+source);
    fetch(
      "/rest/api/wso2-log-client?searchString=" +
        this.state.searchString +
        source
    )
      .then(res => res.json())
      .then(
        result => {
          /*console.log("RESPONSE TEXT -->" + JSON.stringify(result));*/
          this.setState({
            rows: result,
            canLoadTable: true,
            quickSearch: true
          });
        },
        error => {
          console.log("Error in searchHandler : " + error);
        }
      );
  }

  textareaHandler(val) {
    var formData = new FormData();
    formData.append(
      "files",
      new Blob([val.copiedText], {
        type: "text/plain;charset=utf-8"
      }),
      "log-file.txt"
    );
    fetch("/upload", {
      method: "post",
      body: formData
    })
      .then(response => response.text())
      .catch(error => console.error("Error in textareaHandler :", error))
      .then(response =>{

        this.setState({
          rows: response,
          canLoadTable: true
        })
      });
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  handleInit() {
    console.log("FilePond instance has initialised");
  }
  handleFileUpload() {
    this.setState = {
      server: {
        url: "http://localhost:3050",
        timeout: 100000,
        process: {
          url: "/upload",
          method: "POST",
          withCredentials: false,
          onload: response => {
            this.setState({
              rows: JSON.parse(response),
              canLoadTable: true
            });
          },
          onerror: response => {
            console.log(response.data);
          }
        }
      }
    };
  }

  handleChange = event => {
    this.setState({ searchString: event.target.value });
  };
  /*searchHandler(val) {
    const { search } = this.state;

  ******* MAKE THE API CALL TO FETCH THE LOGS USING LOG API *******

    );
  }*/
  render() {
    const canLoadTable = this.state.canLoadTable;
    const inputProps = {
      classes: "textField",
      required: true
    };
    /*const classes = useStyles(this.props);*/
    return (
      <div className="App">
        <MDBContainer fluid>
          <MDBNavbar color="indigo" dark expand="md">
            <MDBNavbarBrand>
              <strong className="white-text">Log Analyzer</strong>
            </MDBNavbarBrand>
            {/* BUTTON */}
            <MDBBtn color="indigo" onClick={this.toggle}>
              Quick Search
            </MDBBtn>
            {/* MODAL */}
            <MDBModal isOpen={this.state.modal} toggle={this.toggle}>
              <MDBModalHeader toggle={this.toggle}>
                Make your search easier
              </MDBModalHeader>
              <TextField
                id="searchString"
                label="Provide the unique string to search"
                placeholder="b4a3c5d1-a1e0-446f-9a85-2fd70901989b"
                inputProps={inputProps}
                margin="normal"
                variant="filled"
                onChange={this.handleChange}
              />
              <MDBModalBody>
                <div>
                  <VerticalLinearStepper searchHandler={this.searchHandler} />
                </div>
              </MDBModalBody>
              <MDBModalFooter>
                <MDBBtn color="secondary" onClick={this.toggle}>
                  Close
                </MDBBtn>
              </MDBModalFooter>
            </MDBModal>
          </MDBNavbar>
        </MDBContainer>
        <MDBContainer fluid>
          <div className="input-container">
            <MDBContainer>
              <Textarea textareaHandler={this.textareaHandler} />
            </MDBContainer>
            <MDBContainer className="filepond-container">
              <FilePond
                ref={ref => (this.pond = ref)}
                files={this.state.files}
                allowMultiple={true}
                maxFiles={1}
                allowImageExifOrientation={true}
                server={this.state.server}
                oninit={() => this.handleInit()}
                onupdatefiles={fileItems => {
                  // Set currently active file objects to this.state
                  this.setState({
                    files: fileItems.map(fileItem => fileItem.file)
                  });
                }}
              />
            </MDBContainer>
          </div>
        </MDBContainer>
        {canLoadTable ? (
          <MDBContainer fluid>
            <Table
              rows={this.state.rows}
              quickSearch={this.state.quickSearch}
            />
          </MDBContainer>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default App;
