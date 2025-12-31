import React from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "@/store/api/auth/authSlice";
import { useAuth } from "@/contexts/AuthContext";
import clsx from "clsx";

// Function to get user initials
const getUserInitials = (name, email) => {
  if (name) {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      // First letter of first name + first letter of last name
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      // First two letters of single name
      return nameParts[0].substring(0, 2).toUpperCase();
    }
  }
  // Fallback to email
  if (email) {
    const emailName = email.split('@')[0];
    return emailName.substring(0, 2).toUpperCase();
  }
  return 'AD';
};

const ProfileLabel = ({ sticky, user }) => {
  const userName = user?.name || user?.email?.split('@')[0] || 'Admin';
  const userRole = user?.role || 'admin';
  const displayRole = userRole.replace(/_/g, ' ').replace(/-/g, ' ');
  const initials = getUserInitials(user?.name, user?.email);
  
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <div
        className={clsx(
          "rounded-full transition-all duration-300 flex items-center justify-center text-white font-semibold bg-indigo-600 dark:bg-indigo-500 ring-1 ring-indigo-700 ring-offset-4 dark:ring-offset-gray-700",
          {
            "h-9 w-9 text-xs": sticky,
            "lg:h-12 lg:w-12 h-7 w-7 lg:text-base text-xs": !sticky,
          }
        )}
      >
        {initials}
      </div>
      {!sticky && (
        <div className="hidden lg:block text-left rtl:text-right">
          <div className="text-sm font-semibold text-gray-700 dark:text-white truncate max-w-[120px]">
            {userName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {displayRole}
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = ({ sticky }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();

  const ProfileMenu = [

    {
      label: "Admin Settings",
      icon: "ph:gear-light",
      status: "yellow",
      action: () => {
        navigate("/admin-profile");
      },
    },
    {
      label: "Orders",
      icon: "ph:chart-bar-light",
      status: "blue",
      action: () => {
        navigate("/orders");
      },
    },
    // {
    //   label: "Get Help",
    //   icon: "ph:question-light",
    //   status: "cyan",
    //   action: () => {
    //     navigate("/settings");
    //   },
    // },
  ];

  const handleLogout = async () => {
    try {
      // Use AuthContext logout which properly removes token via clearAuth()
      await logout();
      // Also clear Redux state
      dispatch(logOut());
      // Navigate to login after token is removed
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, try to clear local state and navigate
      dispatch(logOut());
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };
  const userName = user?.name || user?.email?.split('@')[0] || 'Admin';
  const userRole = user?.role || 'admin';
  const displayRole = userRole.replace(/_/g, ' ').replace(/-/g, ' ');
  const initials = getUserInitials(user?.name, user?.email);

  return (
    <Dropdown
      label={<ProfileLabel sticky={sticky} user={user} />}
      classMenuItems="w-[220px] top-[58px]  "
    >
      <div className="flex items-center px-4 py-3 border-b border-gray-10 mb-3">
        <div className="flex-none ltr:mr-[10px] rtl:ml-[10px]">
          <div className="h-[46px] w-[46px] rounded-full flex items-center justify-center text-white font-semibold text-lg bg-indigo-600 dark:bg-indigo-500">
            {initials}
          </div>
        </div>
        <div className="flex-1 text-gray-700 dark:text-white text-sm font-semibold  ">
          <span className=" truncate w-full block">{userName}</span>
          <span className="block font-light text-xs   capitalize">
            {displayRole}
          </span>
        </div>
      </div>
      <div className=" space-y-3">
        {ProfileMenu.map((item, index) => (
          <Menu.Item key={index}>
            {({ active }) => (
              <div
                onClick={() => item.action()}
                className={`${
                  active
                    ? " text-indigo-500 "
                    : "text-gray-600 dark:text-gray-300"
                } block transition-all duration-150 group     `}
              >
                <div className={`block cursor-pointer px-4 `}>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse ">
                    <span
                      className={`flex-none h-9 w-9  inline-flex items-center justify-center group-hover:scale-110 transition-all duration-200  rounded-full text-2xl  text-white
                       ${item.status === "cyan" ? "bg-cyan-500 " : ""} 
                       ${item.status === "blue" ? "bg-indigo-500 " : ""} 
                      ${item.status === "red" ? "bg-red-500 " : ""} 
                      ${item.status === "green" ? "bg-green-500 " : ""}${
                        item.status === "yellow" ? "bg-yellow-500 " : ""
                      }
                      `}
                    >
                      <Icon icon={item.icon} />
                    </span>
                    <span className="block text-sm">{item.label}</span>
                  </div>
                </div>
              </div>
            )}
          </Menu.Item>
        ))}
        <Menu.Item onClick={handleLogout}>
          <div
            className={`block cursor-pointer px-4 border-t border-gray-10 py-3 mt-1 text-indigo-500 `}
          >
            <Button
              icon="ph:upload-simple-light"
              rotate={1}
              text="Logout"
              className="btn-primary block w-full btn-sm "
            />
          </div>
        </Menu.Item>
      </div>
    </Dropdown>
  );
};

export default Profile;
