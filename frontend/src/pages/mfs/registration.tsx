import MFSProfileForm from "@components/mfs/MFSProfileForm";
import { RootState } from "@redux/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

export default function Registration() {
  const auth = useSelector(
    (state: RootState) => state.persistedReducer.authReducer.auth
  );

  const navigate = useNavigate();
  useEffect(() => {
    if (!auth) {
      navigate("/mfs/login");
    }
  }, [auth, navigate]);

  return <>{auth && <MFSProfileForm user_id={auth.id || 0} />}</>;
}
