const Admin_Searchbar = () => {
  return (
    <>
      <div className="hidden sm:flex">
        <span
          className={`material-symbols-outlined absolute bottom-3 left-8 bg-transparent p-2 text-[18px] text-zinc-500`}
        >
          search
        </span>
        <input
          className="roboto-regular w-[15vw] min-w-[175px] rounded-sm border-2 border-zinc-100 bg-zinc-100 py-[6px] pl-8 text-sm text-zinc-900 outline-none outline-1 focus:border-zinc-300"
          placeholder="Search"
        />
      </div>
      
    </>
  );
};

export default Admin_Searchbar;
