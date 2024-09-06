// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import bkash from "../assets/BKash-Icon-Logo.wine.svg";
// import nagad from "../assets/Nagad-Logo.wine.svg";
// import google from "../assets/Google_Pay-Logo.wine.svg";
// import apple from "../assets/Apple_Pay-Logo.wine.svg";

// const UserLogin: React.FC = () => {
//   const [selectedMFS, setSelectedMFS] = useState<string>("");
//   const [amount, setAmount] = useState<string>("");
//   const [destinationMFS, setDestinationMFS] = useState<string>("");

//   const handleMFSSelect = (mfs: string) => {
//     setSelectedMFS(mfs);
//   };

//   const handleDestinationMFSSelect = (mfs: string) => {
//     setDestinationMFS(mfs);
//   };

//   return (
//     <div className="container mx-auto mt-56 p-4 border rounded-lg shadow-lg max-w-md">
//       <h2 className="text-xl font-semibold mb-4">User Login</h2>

//       {/* Link MFS Selection */}
//       <div className="mb-4">
//         <label className="block text-white font-medium mb-2">Link MFS</label>
//         <div className="flex flex-col gap-2">
//           <button
//             className={`flex items-center p-2 border rounded text-black ${
//               selectedMFS === "bkash" ? "bg-green-400" : "bg-white"
//             }`}
//             onClick={() => handleMFSSelect("bkash")}
//           >
//             <img
//               src={bkash}
//               alt="Bkash"
//               width={24}
//               height={24}
//               className="mr-2"
//             />
//             Bkash
//           </button>
//           <button
//             className={`flex items-center p-2 border rounded text-black ${
//               selectedMFS === "nagad" ? "bg-green-400" : "bg-white"
//             }`}
//             onClick={() => handleMFSSelect("nagad")}
//           >
//             <img
//               src={nagad}
//               alt="Nagad"
//               width={24}
//               height={24}
//               className="mr-2"
//             />
//             Nagad
//           </button>
//         </div>
//       </div>

//       {/* Amount Input */}
//       <div className="mb-4">
//         <label htmlFor="amount" className="block text-white font-medium mb-2">
//           Amount to Transfer
//         </label>
//         <input
//           id="amount"
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           className="w-full p-2 border rounded text-black"
//           placeholder="Enter amount"
//         />
//       </div>

//       {/* Select Destination MFS */}
//       <div className="mb-4">
//         <label className="block text-white font-medium mb-2">
//           Select Destination MFS
//         </label>
//         <div className="flex flex-col gap-2">
//           <button
//             className={`flex items-center p-2 border rounded text-black ${
//               destinationMFS === "googlePay" ? "bg-green-400" : "bg-white"
//             }`}
//             onClick={() => handleDestinationMFSSelect("googlePay")}
//           >
//             <img
//               src={google}
//               alt="Google Pay"
//               width={24}
//               height={24}
//               className="mr-2"
//             />
//             Google Pay
//           </button>
//           <button
//             className={`flex items-center p-2 border rounded text-black ${
//               destinationMFS === "applePay" ? "bg-green-400" : "bg-white"
//             }`}
//             onClick={() => handleDestinationMFSSelect("applePay")}
//           >
//             <img
//               src={apple}
//               alt="Apple Pay"
//               width={24}
//               height={24}
//               className="mr-2"
//             />
//             Apple Pay
//           </button>
//         </div>
//       </div>

//       {/* Confirm Button */}
//       <Dialog>
//         <DialogTrigger asChild>
//           <div className="flex justify-center">
//             <Button>Confirm</Button>
//           </div>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle className="text-green-400">
//               Transaction Successful!
//             </DialogTitle>
//             <DialogDescription>
//               Transaction Hash:{" "}
//               <span className="text-orange-400">
//                 0xa01358717730026c0f0a30f...c810bf6511c7f2e1a8e9f955e
//               </span>
//             </DialogDescription>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default UserLogin;

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import bkash from "../assets/BKash-Icon-Logo.wine.svg";
// import nagad from "../assets/Nagad-Logo.wine.svg";
// import google from "../assets/Google_Pay-Logo.wine.svg";
// import apple from "../assets/Apple_Pay-Logo.wine.svg";

// const UserLogin: React.FC = () => {
//   const [selectedMFS, setSelectedMFS] = useState<string>("");
//   const [amount, setAmount] = useState<string>("");
//   const [destinationMFS, setDestinationMFS] = useState<string>("");

//   const mfsOptions = [
//     { value: "", label: "Select MFS", icon: "" },
//     { value: "bkash", label: "Bkash", icon: bkash },
//     { value: "nagad", label: "Nagad", icon: nagad },
//   ];

//   const destinationMFSOptions = [
//     { value: "", label: "Select Destination MFS", icon: "" },
//     { value: "googlePay", label: "Google Pay", icon: google },
//     { value: "applePay", label: "Apple Pay", icon: apple },
//   ];

//   return (
//     <div className="container mx-auto mt-56 p-4 border rounded-lg shadow-lg max-w-md">
//       <h2 className="text-xl font-semibold mb-4">User Login</h2>

//       {/* Link MFS Dropdown */}
//       <div className="mb-4">
//         <label className="block text-white font-medium mb-2">Link MFS</label>
//         <select
//           value={selectedMFS}
//           onChange={(e) => setSelectedMFS(e.target.value)}
//           className="w-full p-2 border rounded text-black"
//         >
//           {mfsOptions.map((mfs) => (
//             <option key={mfs.value} value={mfs.value}>
//               {mfs.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Amount Input */}
//       <div className="mb-4">
//         <label htmlFor="amount" className="block text-white font-medium mb-2">
//           Amount to Transfer
//         </label>
//         <input
//           id="amount"
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           className="w-full p-2 border rounded text-black"
//           placeholder="Enter amount"
//         />
//       </div>

//       {/* Select Destination MFS Dropdown */}
//       <div className="mb-4">
//         <label
//           htmlFor="destinationMFS"
//           className="block text-white font-medium mb-2"
//         >
//           Select Destination MFS
//         </label>
//         <select
//           id="destinationMFS"
//           value={destinationMFS}
//           onChange={(e) => setDestinationMFS(e.target.value)}
//           className="w-full p-2 border rounded text-black"
//         >
//           {destinationMFSOptions.map((mfs) => (
//             <option key={mfs.value} value={mfs.value}>
//               {mfs.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Confirm Button */}
//       <Dialog>
//         <DialogTrigger asChild>
//           <div className="flex justify-center">
//             <Button>Confirm</Button>
//           </div>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle className="text-green-400">
//               Transaction Successful!
//             </DialogTitle>
//             <DialogDescription>
//               Transaction Hash:{" "}
//               <span className="text-orange-400">
//                 0xa01358717730026c0f0a30f...c810bf6511c7f2e1a8e9f955e
//               </span>
//             </DialogDescription>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default UserLogin;

import React, { useState } from "react";
import bkash from "../assets/BKash-Icon-Logo.wine.svg";
import nagad from "../assets/Nagad-Logo.wine.svg";
import google from "../assets/Google_Pay-Logo.wine.svg";
import apple from "../assets/Apple_Pay-Logo.wine.svg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const options = [
  { value: "bkash", label: "Bkash", icon: bkash },
  { value: "nagad", label: "Nagad", icon: nagad },
];

const destinationOptions = [
  { value: "googlePay", label: "Google Pay", icon: google },
  { value: "applePay", label: "Apple Pay", icon: apple },
];

const CustomDropdown: React.FC<{
  selectedValue: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon: string }[];
  label: string;
}> = ({ selectedValue, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-white font-medium mb-2">{label}</label>
      <button
        type="button"
        className="w-full p-2 border rounded text-black bg-white flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        {options.find((opt) => opt.value === selectedValue)?.label || "Select"}
        <span className="ml-2">▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border rounded mt-1">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="p-2 flex items-center cursor-pointer hover:bg-gray-200"
            >
              <img
                src={option.icon}
                alt={option.label}
                className="mr-2"
                width={80} // Increased size
                height={80} // Increased size
              />
              <span className="text-black">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UserLogin: React.FC = () => {
  const [selectedMFS, setSelectedMFS] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [destinationMFS, setDestinationMFS] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");

  return (
    <div className="container mx-auto mt-56 p-4 border rounded-lg shadow-lg max-w-md">
      <h2 className="text-xl font-semibold mb-4">User Login</h2>

      {/* Link MFS Dropdown */}
      <CustomDropdown
        selectedValue={selectedMFS}
        onChange={setSelectedMFS}
        options={options}
        label="Link MFS"
      />

      {/* Amount Input */}
      <div className="mb-4">
        <label htmlFor="amount" className="block text-white font-medium mb-2">
          Amount to Transfer
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded text-black"
          placeholder="Enter amount"
        />
      </div>

      {/* Select Destination MFS Dropdown */}
      <CustomDropdown
        selectedValue={destinationMFS}
        onChange={setDestinationMFS}
        options={destinationOptions}
        label="Select Destination MFS"
      />

      {/* Account Number Input */}
      {destinationMFS && (
        <div className="mb-4">
          <label
            htmlFor="accountNumber"
            className="block text-white font-medium mt-4 mb-2"
          >
            Account Number
          </label>
          <input
            id="accountNumber"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full p-2 border rounded text-black"
            placeholder="Enter account number"
            required
          />
        </div>
      )}
      {/* Confirm Button */}
      <div className="my-5">
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex justify-center">
              <Button>Confirm</Button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-green-400">
                Transaction Successful!
              </DialogTitle>
              <DialogDescription>
                Transaction Hash:{" "}
                <span className="text-orange-400">
                  0xa01358717730026c0f0a30f...c810bf6511c7f2e1a8e9f955e
                </span>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserLogin;
