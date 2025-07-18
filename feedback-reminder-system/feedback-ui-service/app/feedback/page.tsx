import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MicVocal } from "lucide-react";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="h-screen flex">
      <div className=" flex-1 bg-[url('/images/backbground.png')] bg-cover bg-center"></div>
      <div className="flex-1 pl-16 flex items-center ">
        <div className="p-5 flex flex-col gap-6 max-w-[600px] flex-1">
          <h1 className="text-2xl">FeedBack</h1>

          <Input type="text" placeholder="Name" />

          {/* ==================================== */}

          <Input type="email" placeholder="Department" />

          {/* ==================================== */}

          <Select>
            <SelectTrigger className="w-full py-4">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Language</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* ==================================== */}

          <Textarea placeholder="Type your message here." />

          {/* ==================================== */}

          <Button className="w-fit">
            <MicVocal />
            Voice
          </Button>

          <Button>Submit</Button>
        </div>
      </div>
    </div>
  );
};

export default page;
