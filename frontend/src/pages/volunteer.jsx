import NavBar from '../components/NavBar.jsx';
import WeeklyCalendar from '../components/WeeklyCalendar.jsx';

function VolunteerPage() {
  return (
    <div className="min-h-screen bg-[#dfbfdf]">
      <NavBar />

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-center items-center gap-8 py-8 px-4">
        <button className="text-2xl font-bold">signup</button>
        <button className="text-2xl font-bold">map</button>
        <button className="text-2xl font-bold">our cats</button>
        <button className="text-2xl font-bold">feeding instructions</button>
        <button className="text-2xl font-bold">you</button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden grid grid-cols-2 gap-4 p-4">
        <button className="bg-white/30 p-4 rounded-lg">signup</button>
        <button className="bg-white/30 p-4 rounded-lg">our cats</button>
        <button className="bg-white/30 p-4 rounded-lg">map</button>
        <button className="bg-white/30 p-4 rounded-lg">you</button>
        <button className="bg-white/30 p-4 rounded-lg col-span-2">feeding instructions</button>
      </div>

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>

      <WeeklyCalendar />

      {/* Spacer div */}
      <div className="h-3 sm:h-4 md:h-10 lg:h-14"></div>

    </div>
  );
}

export default VolunteerPage;