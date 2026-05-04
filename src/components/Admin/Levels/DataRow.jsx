import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import LevelMenu from "./LevelMenu";

const DataRow = (props) => {

  const [menu, setMenu] = useState(false);

  const toggleMenu = () => {
    setMenu(!menu);
  }

  const toggleEditeMenu = () => {
    return props.editLevel(props);
  }

  return (
    <>
      <div className="min-w-full">
        <div
          style={{ backgroundColor: props.bgColor }}
          className={`min-w-full border-b flex border-grey items-center`}
        >
          <div className="flex flex-row items-center flex-1 py-[6px] my-1  md:pl-3 md:pr-5 ">
            <p
              className={`w-full md:flex-[1] flex-[1] md:text-[14px] text-[11px] text-center md:text-left ${props.header ? "font-semibold" : ""
                }`}
            >
              {props.index + "."}
            </p>
            <p
              className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
                }`}
            >
              {props.levelName}
            </p>
            <p
              className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
                }`}
            >
              {props.levelId}
            </p>
          </div>
          <div className="flex ml-3 mr-2 lg:mr-5 cursor-pointer">
            <div
              onClick={() => {
                toggleMenu();
              }}
              className={`w-full my-1 md:my-0 text-center md:text-center md:text-[20px] text-[14px] ${props.header ? "hidden" : ""
                }`}
            >
              {menu && <LevelMenu
                isopen={menu}
                editLevel={toggleEditeMenu}
                deleteLevel={() => props.deleteLevel(props.levelId)}
                setIsOpen={setMenu}
              />}
              <BsThreeDotsVertical />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataRow;
