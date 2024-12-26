import { Fragment } from "react";
import SRTChart from "./common/SRTChart";
import FCFSChart from "./common/FCFSChart";
import "./globals.css";
import SJFChart from "./common/SJFChart";
import FIFOChart from "./common/FIFOChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RRChart from "./common/RRChart";
import HRRNChart from "./common/HRRNChart";
import LRTFChart from "./common/LRTFChart";
import DeadlineChart from "./common/DeadlineChart";

const Home = () => {
  return (
    <Fragment>
      <Tabs
        defaultValue="SRTChart"
        className=" pt-5"
        style={{
         
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          
        }}>
        <TabsList style={{width:'50%' , margin:'auto'}}>
          <TabsTrigger value="SRTChart">SRTChart</TabsTrigger>
          <TabsTrigger value="FCFSChart">FCFSChart</TabsTrigger>
          <TabsTrigger value="SJFChart">SJFChart</TabsTrigger>
          <TabsTrigger value="FIFOChart">FIFOChart</TabsTrigger>
          <TabsTrigger value="RRChart">RRChart</TabsTrigger>
          <TabsTrigger value="HRRNChart">HRRNChart</TabsTrigger>
          <TabsTrigger value="LRTFChart">LRTFChart</TabsTrigger>
          <TabsTrigger value="DeadlineChart">DeadlineChart</TabsTrigger>
        </TabsList>
        <TabsContent value="SRTChart">
          <SRTChart />
        </TabsContent>
        <TabsContent value="FCFSChart">
          <FCFSChart />
        </TabsContent>
        <TabsContent value="SJFChart">
          <SJFChart />
        </TabsContent>
        <TabsContent value="FIFOChart">
          <FIFOChart />
        </TabsContent>
        <TabsContent value="RRChart">
          <RRChart />
        </TabsContent>
        
        <TabsContent value="HRRNChart">
        <HRRNChart/>
        </TabsContent>
        <TabsContent value="LRTFChart">
        <LRTFChart/>
        </TabsContent>
        <TabsContent value="DeadlineChart">
        <DeadlineChart/>
        </TabsContent>
        
      </Tabs>
    </Fragment>
  );
};

export default Home;
