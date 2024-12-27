"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import React from "react"


export function Charts(props) {
  console.log(props);
    function generateFancyRGBColor() {
      const channels = [0, 0, 0]; // سه کانال RGB
      const primaryIndex = Math.floor(Math.random() * 3); // انتخاب یک کانال به صورت تصادفی برای مقدار بالا
    
      // تنظیم مقدار بالا برای یک کانال اصلی
      channels[primaryIndex] = Math.floor(Math.random() * 56) + 200; // مقدار بین 200 تا 255
    
      // تنظیم مقدار بالا برای یک کانال ثانویه (برای تنوع)
      const secondaryIndex = (primaryIndex + Math.floor(Math.random() * 2) + 1) % 3;
      channels[secondaryIndex] = Math.floor(Math.random() * 156) + 100; // مقدار بین 100 تا 255
    
      return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
    }
    
  // const chartData = [
  //   { month: "January", desktop: 186, mobile: 80 },
  //   { month: "February", desktop: 305, mobile: 200 },
  //   { month: "March", desktop: 237, mobile: 120 },
  //   { month: "April", desktop: 73, mobile: 190 },
  //   { month: "May", desktop: 209, mobile: 130 },
  //   { month: "June", desktop: 214, mobile: 140 },
  // ]
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
    label: {
      color: "hsl(var(--background))",
    },
  } 
  const [chartData, setData] = React.useState([]);

  React.useEffect(() => {
    const data = [];
    props.data.map((i) => {
      const colorDataRes = props.processes.find(item=>{
        if(item.id === i.id){
          return item
        }
      })
      console.log(colorDataRes);
      console.log(colorDataRes.color);
      console.log(i[props.name]);
      data.push({
        month: i.id,
        desktop: i[props.name],
        fill:colorDataRes.color
      }) 
    });
    console.log(data);
    setData(data);
  }, [props]);


  return (
    <Card className='mb-1' >
    <CardHeader>
      <CardTitle>{props.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} >
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            right: 16,
          }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="month"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
            hide
          />
          <XAxis dataKey="desktop" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Bar
            dataKey="desktop"
            layout="vertical"
            fill="var(--color-desktop)"
            radius={10}
            height={100}
          >
            <LabelList
              dataKey="month"
              position="insideLeft"
              offset={8}
              className="fill-[--color-label]"
              fontSize={12}
            />
            <LabelList
              dataKey="desktop"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </CardContent>
    
  </Card>
  )
}
