import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import DotsMenu from "../../../components/Admin/ManageUsers/DotsMenu";
import DataRows from "../../../components/Admin/ManageUsers/DataRows";
import RequestModal from "../../../components/Admin/ManageUsers/RequestModal";
import AddUserModal from "../../../components/Admin/ManageUsers/AddUserModal";
import EditUserModal from "../../../components/Admin/ManageUsers/EditUserModal";

import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { deleteUser, updateUser } from "../../../api/Admin/UsersApi";

const ManageUsers = () => {

  const { isBlurred, toggleBlur } = useBlur();

  const [isMenu, setIsMenu] = useState(false);
  const [editData, setEditData] = useState({});
  const [requestCount, setReqCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectText, setSelectText] = useState("student");
  const [requestsModal, setRequestsModal] = useState(false);
  const [isAddUserModal, setIsAddUserModal] = useState(false);
  const [isEditUserModal, setIsEditUserModal] = useState(false);
  const { adminUsersDataPending, adminUsersData, adminUsersRefecth } = useAdmin();


  const toggleRequestModal = () => {
    setRequestsModal(!requestsModal);
  }

  const toggleAddUserModal = () => {
    setIsAddUserModal(!isAddUserModal);
  }

  const toggleEditUserModal = () => {
    setIsEditUserModal(!isEditUserModal);
    toggleBlur();
    setIsMenu(false);
  }

  const accessMutation = useMutation({
    mutationKey: ["access", "fees"], mutationFn: async () => {
      let result;
      if (!editData.isBlocked && editData.feesPaid) {
        result = await updateUser({ isBlocked: true, feesPaid: false }, editData.id);
      } else {
        result = await updateUser({ isBlocked: false, feesPaid: true }, editData.id);
      }
      await adminUsersRefecth();
      return result;
    },
    onSettled: async (data, error) => {
      setIsMenu(false);
      if (error) {
        console.log("error in toggle access : ", error)
        return;
      }
      console.log(" data after toggle access is : ", data);
      return;
    }
  })

  const toggleMenu = (data) => {
    console.log("user data is : ", data);
    setEditData(data);
    setIsMenu(!isMenu);
  }

  const handleFunctionClick = (usr) => { };

  useEffect(() => {
    let count = 0;
    adminUsersData.allUsers.map((item) => {
      if (item.isAccepted == false) {
        count++;
      }
    })
    setReqCount(count);
  }, [adminUsersData.allUsers])

  const handleDeleteUser = async () => {
    userDellMutation.mutate(editData.id);
  }

  const userDellMutation = useMutation({
    mutationKey: ["deleteuser"],
    mutationFn: async (id) => {
      const result = await deleteUser(id);
      await adminUsersRefecth();
      return result
    },
    onSettled: async (data) => {
      toast.success("user deleted successfully");
      setIsMenu(false);
      console.log(data);
    }
  })

  return (
    accessMutation.isPending || adminUsersDataPending || userDellMutation.isPending ? <div className="flex flex-1"> <Loader /> </div> :
      <>
        <div className="w-full bg-[#F9F9F9] font-poppins">
          <div className="flex flex-1">
            <div className={`w-full min-h-full lg:px-10 sm:px-6 px-3 flex-grow lg:ml-72`}>
              <div className="min-h-full">
                <Navbar heading={"Manage Users"} />
                <div className={`${isBlurred ? "blur" : ""}`}>

                  {/* ─── Toolbar ─── */}
                  <div className="flex flex-col sm:flex-row-reverse gap-3 my-4">

                    {/* Right group: search + select + buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3 w-full sm:w-auto">

                      {/* Search input — full width on mobile */}
                      <div className="flex items-center gap-2 border bg-white border-[#00000020] px-4 py-2 rounded-3xl w-full sm:w-auto">
                        <IoSearch className="shrink-0" />
                        <input
                          type="text"
                          className="bg-transparent outline-none w-full sm:w-auto"
                          placeholder="Search Users"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </div>

                      {/* Select dropdown — full width on mobile */}
                      <div className="flex items-center border bg-white border-[#00000020] px-4 py-2 rounded-xl w-full sm:w-auto">
                        <select
                          className="px-2 w-full bg-transparent outline-none"
                          onChange={(e) => setSelectText(e.target.value)}
                        >
                          <option value="student" className="px-2 py-1">Student</option>
                          <option value="teacher" className="px-2 py-1">Teacher</option>
                          <option value="parent" className="px-2 py-1">Parent</option>
                        </select>
                      </div>

                      {/* Requests modal */}
                      <div>
                        {requestsModal && (
                          <RequestModal
                            onclose={() => setRequestsModal(false)}
                            refetch={adminUsersRefecth}
                            data={adminUsersData.allUsers}
                          />
                        )}
                      </div>

                      {/* Action buttons — side by side, full width row on mobile */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={toggleRequestModal}
                          className="flex-1 sm:flex-none cursor-pointer flex py-2 px-4 rounded-3xl bg-[#cccffa] text-[#0B1053] text-sm items-center justify-center gap-2"
                        >
                          Requests{" "}
                          <span className="text-xs px-2 py-1 bg-[#a5aaf3] text-[#0B1053] rounded-3xl">
                            {requestCount}
                          </span>
                        </button>
                        <button
                          onClick={toggleAddUserModal}
                          className="flex-1 sm:flex-none cursor-pointer flex py-2 px-4 rounded-3xl bg-[#6A00FF] text-white text-sm items-center justify-center"
                        >
                          Add User
                        </button>
                      </div>

                    </div>
                  </div>
                  {/* ─── End Toolbar ─── */}

                  <div className="my-2 min-h-[400px] overflow-x-auto">
                    <DataRows
                      header={true}
                      role={"Role"}
                      userId={selectText === "teacher" || selectText === "parent" ? "Reference No" : "Roll No"}
                      index={"Sr No"}
                      userName={"Name"}
                      userclass={"Class"}
                      contact={"Contact"}
                      bgColor={"#F9F9F9"}
                    />

                    {adminUsersData?.allUsers
                      ?.filter((usr) => {
                        const matchesName =
                          searchText && usr.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase());
                        const matchesRollNo =
                          searchText && usr.rollNo && usr.rollNo.includes(searchText);
                        const matchesUserType =
                          selectText && usr.userType === selectText.toLocaleLowerCase();

                        if (!searchText && selectText) return matchesUserType;
                        if (searchText && !selectText) return matchesName || matchesRollNo;
                        if (searchText && selectText) return matchesUserType && (matchesName || matchesRollNo);
                        return true;
                      })
                      .map((usr, index) => (
                        <DataRows
                          data={usr}
                          key={usr.id}
                          header={false}
                          index={index + 1}
                          bgColor={"#FFFFFF"}
                          userName={usr.name}
                          role={usr.userType}
                          userclass={usr?.class}
                          contact={usr.phoneNumber}
                          userId={
                            usr?.userType === "teacher"
                              ? `${usr.referenceNo}`
                              : usr?.userType === "parent"
                                ? usr?.id.slice(0, 5)
                                : usr?.rollNo || "not assign"
                          }
                          toggleClassMenu={(e) => toggleMenu(e)}
                          onClickFunction={handleFunctionClick(usr)}
                        />
                      ))}

                    {adminUsersData.allUsers.length == 0 && (
                      <div className="text-center py-4 text-3xl font-medium">No users to display!</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <DotsMenu
          isopen={isMenu}
          data={editData}
          toggleAccess={accessMutation.mutate}
          setIsOpen={setIsMenu}
          deleteUser={handleDeleteUser}
          editUser={toggleEditUserModal}
        />
        {isAddUserModal && <AddUserModal refetch={adminUsersRefecth} closeModal={toggleAddUserModal} />}
        {isEditUserModal && <EditUserModal refetch={adminUsersRefecth} closeModal={toggleEditUserModal} data={editData} />}
      </>
  );
}

export default ManageUsers;
