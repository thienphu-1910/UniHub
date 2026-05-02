import Button from "../component/common/Button";
import Container from "../component/common/Container";
import { User, Mail, LogOut } from "lucide-react";
import { authenticationService } from "../services/authenticationService";

const SettingPage = () => {

  const handleLogout = () => {
    authenticationService.logout();
    window.location.href = '/login';
  }

  return (
    <div className="w-full">
      <h1 className="font-bold text-2xl mb-1">Account Setting</h1>
      <p className="font-normal text-black/50 text-base">
        Manage your institutional profile and security preferences
      </p>
      <div className="grid grid-cols-3 mt-5 w-full">
        <Container className="col-span-2 flex flex-col justify-start px-8 py-6 w-full gap-5">
          <div className="w-full flex flex-row  justify-between">
            <div className="w-60 flex flex-col gap-1">
              <label htmlFor="#fullname" className="font-semibold">
                Full Name
              </label>
              <div className="flex flex-row justify-start text-blue-500 gap-2 px-2 py-1 w-full border rounded-md">
                <User />
                <input
                  id="fullname"
                  className="outline-none"
                  readOnly
                  value="Nguyen Van A"
                />
              </div>
            </div>
            <div className="w-60 flex flex-col gap-1">
              <label htmlFor="#mail" className="font-semibold">
                Email
              </label>
              <div className="flex flex-row justify-start text-blue-500 gap-2 px-2 py-1 w-full border rounded-md">
                <Mail />
                <input
                  id="mail"
                  className="outline-none"
                  readOnly
                  value="example@gmail.com"
                />
              </div>
            </div>
          </div>

          <Button variant='dangerous' className="self-end max-w-50" onClick={handleLogout}>
            <LogOut />
            Sign Out
          </Button>
        </Container>
      </div>
    </div>
  );
}

export default SettingPage
