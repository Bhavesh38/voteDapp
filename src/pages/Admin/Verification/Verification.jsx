import React, { useState, useEffect } from "react";
import Navbar from "../../../components/NavBar/Navbar";
import NavbarAdmin from "../../../components/NavBar/NavbarAdmin";
import Web3 from "web3";
import {
  ELECTION_CONTRACT_ADDRESS,
  ELECTION_CONTRACT_ABI,
} from "../../../utils/constance";
import { Container } from "./styles";
import AdminOnly from "../../../components/AdminOnly";
import Loader from "../../../components/Loader/Loader";
import axios from "axios";

const Verification = () => {
  const [ElectionInstance, setElectionInstance] = useState(undefined);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [voterCount, setVoterCount] = useState(undefined);
  const [voters, setVoters] = useState([]);
  const [predictionLoading, setPredictionLoading] = useState(false);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
        let acc = accounts[0];
        setWeb3(web3);
        const electionInstance = new web3.eth.Contract(
          ELECTION_CONTRACT_ABI,
          ELECTION_CONTRACT_ADDRESS
        );

        setElectionInstance(electionInstance);

        const admin = await electionInstance.methods.admin().call();
        if (admin === acc) {
          setIsAdmin(true);
        }

        const voterCount = await electionInstance.methods
          .getTotalVoter()
          .call();
        setVoterCount(voterCount);

        const allVoter = await electionInstance.methods.getAllVoters().call();
        setVoters(allVoter);
        console.log(allVoter);
      } catch (error) {
        console.log(error);
      }
    } else {
      window.alert("Please install MetaMask");
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  const veryfyVoter = async (verifiedStatus, address) => {
    await ElectionInstance.methods
      .verifyVoter(verifiedStatus, address)
      .send({ from: account });

    window.location.reload();
  };

  if (!web3) {
    return (
      <Container>
        {isAdmin ? <NavbarAdmin /> : <Navbar />}
        <center>Loading Web3, accounts, and contract...</center>
        <Loader />
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container>
        {isAdmin ? <NavbarAdmin /> : <Navbar />}
        <center>Only Admin can access this page.</center>
      </Container>
    );
  }

  return (
    <Container>
      <NavbarAdmin />
      <div className="container-main">
        <h3>Verification</h3>
        <small>Total Voters: {voterCount || 0}</small>
        {voterCount < 1 ? (
          <div className="container-item info">None has registered yet.</div>
        ) : (
          <>
            <div className="container-item info">
              <p
                style={{
                  fontSize: "3rem",
                  fontWeight: "bold",
                  alignSelf: "center",
                  textAlign: "center",
                  marginBottom: "50px",
                }}
              >
                List of registered voters
              </p>
            </div>
            <table className="table">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Account address</th>
                  <th scope="col">Voter Id</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Verified</th>
                  <th scope="col">Gov Id</th>
                  <th scope="col">Photo</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{voter["voterAddress"].substring(0, 10) + "..."}</td>
                    <td>{voter["voterIdNumber"]}</td>
                    <td>{voter["name"]}</td>
                    <td>{voter["email"]}</td>
                    <td>{voter["phone"]}</td>

                    <td>{voter["isVerified"] ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          window.open(
                            `https://gateway.pinata.cloud/ipfs/${voter["govId"]}`
                          )
                        }
                        target="_blank"
                      >
                        See
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          window.open(
                            `https://gateway.pinata.cloud/ipfs/${voter["currentImage"]}`
                          )
                        }
                        target="_blank"
                      >
                        See
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() => veryfyVoter(true, voter["voterAddress"])}
                        disabled={voter["isVerified"]}
                      >
                        {voter[3] ? "Verified" : "Verify"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Container>
  );
};

export default Verification;
