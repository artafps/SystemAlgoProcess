import { Fragment } from "react";
import SRTChart from "./common/SRTChart";
import FCFSChart from "./common/FCFSChart";
import "./globals.css"
const Home = () => {
  return ( <Fragment>
    <SRTChart/>
    <hr/>
    <FCFSChart/>
  </Fragment> );
}
 
export default Home;