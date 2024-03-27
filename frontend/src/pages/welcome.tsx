import { Button } from "@components/ui/button";
import { Link } from "react-router-dom";

export default function welcome() {
  return (
    <div><Link to={"/dashboard"}><Button>Go to Demo Dashboard</Button></Link></div>
  )
}
