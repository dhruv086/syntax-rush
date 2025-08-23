import Image from "next/image";
import NavBar from "./components/navBar";
import Prog from "./components/problem/prog";

export default function Home() {
  return (
    <div>
      <NavBar />
      <Prog />
    </div>
  );
}
