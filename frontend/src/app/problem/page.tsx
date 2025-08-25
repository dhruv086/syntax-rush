import React from "react";
import NavBar from "@/app/components/navBar";
import Prog from "@/app/components/problem/prog";
import Cal from "@/app/components/problem/cal";
import Chat from "@/app/components/problem/chat";
import Ques from "@/app/components/problem/ques";
import Todays from "@/app/components/problem/todays";

export default function problem() {
  return (
    <div className="">
      <NavBar />

      <div className="grid grid-cols-4 grid-rows-7 gap-6 min-h-[85vh] max-h-[85vh] ">
        <div className="col-span-3 row-span-2">
          <Prog />
        </div>
        <div className="col-span-3 row-span-5 col-start-1 row-start-3">
          <Ques />
        </div>
        <div className="row-span-3 col-start-4 row-start-1">
          <Cal />
        </div>
        <div className="col-start-4 row-start-4">
          <div className="h-32">
            <Todays />
          </div>
        </div>
        <div className="row-span-3 col-start-4 mt-4 row-start-5">
          <Chat />
        </div>
      </div>
    </div>
  );
}
