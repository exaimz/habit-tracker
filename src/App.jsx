import { useState, useEffect } from "react";
import { Plus, Check, Award, Flame, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";

const INITIAL_HABITS = [];

// Generate an array of the last 7 days
const daysOfWeek = Array.from({ length: 7 }).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index)); // Go back up to 6 days ago
  return {
    name: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1), // "M", "T", "W"...
    number: date.getDate(),
    fullDate: date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    isToday: date.toDateString() === new Date().toDateString(),
  };
});

function App() {
  const [selectedDate, setSelectedDate] = useState(daysOfWeek[6].fullDate);
  const handleCalendarChange = (clickedDate) => {
    const formattedString = clickedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    setSelectedDate(formattedString);
  };

  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem("minimal-habits");
    return savedHabits ? JSON.parse(savedHabits) : INITIAL_HABITS;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  useEffect(() => {
    localStorage.setItem("minimal-habits", JSON.stringify(habits));
  }, [habits]);

  // Add Habit function
  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return; // Don't add empty habits

    const newHabit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      completedDays: [],
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName("");
    setIsAdding(false);
  };

  // Delete Habit function
  const deleteHabit = (habitId) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = [...habits];

    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setHabits(items);
  };

  //Toggle Habit function
  const toggleHabit = (habitId) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== habitId) return habit;

        const isCompletedToday = habit.completedDays.includes(selectedDate);

        const updatedDays = isCompletedToday
          ? habit.completedDays.filter((day) => day !== selectedDate)
          : [...habit.completedDays, selectedDate];

        // streak adjustment
        let updatedStreak = habit.streak;
        if (!isCompletedToday && selectedDate === daysOfWeek[6].fullDate) {
          updatedStreak += 1; // Increment streak if completing *today*
        } else if (
          isCompletedToday &&
          selectedDate === daysOfWeek[6].fullDate
        ) {
          updatedStreak = Math.max(0, updatedStreak - 1); // Decrement safely
        }

        return {
          ...habit,
          completedDays: updatedDays,
          streak: updatedStreak,
        };
      }),
    );
  };

  const habitsToday = habits.length;
  const completedToday = habits.filter((h) =>
    h.completedDays.includes(selectedDate),
  ).length;
  const completionPercentage =
    habitsToday > 0 ? Math.round((completedToday / habitsToday) * 100) : 0;

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (completionPercentage / 100) * circumference;

  const topStreaks = [...habits]
    .filter((habit) => habit.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3); // Get top 3 streaks

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 p-6 md:p-12 font-sans antialiased">
      {/* Centered maximum width container to keep things looking balanced on huge screens */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left column */}
        <main className="lg:col-span-2 space-y-10">
          {/* Header Section */}
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-medium">
              {selectedDate === daysOfWeek[6].fullDate ? "Today" : selectedDate}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
              Focus on today.
            </h1>
          </header>

          {/* Placeholders */}
          <section className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 backdrop-blur-sm flex justify-between items-center gap-2">
            {daysOfWeek.map((day, idx) => {
              const isSelected = selectedDate === day.fullDate;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day.fullDate)}
                  className={`flex flex-col items-center flex-1 py-3 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? "bg-zinc-800/60 text-zinc-100 border border-zinc-700/50 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent"
                  }`}
                >
                  {/* Day Initial (M, T, W...) */}
                  <span className="text-xs font-mono tracking-wider uppercase font-medium">
                    {day.name}
                  </span>

                  {/* Calendar Number */}
                  <span
                    className={`text-base font-semibold mt-1 ${isSelected ? "text-emerald-400" : ""}`}
                  >
                    {day.number}
                  </span>

                  {/* Tiny indicator dot for current day */}
                  {day.isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-zinc-600 mt-1 absolute transform translate-y-7" />
                  )}
                </button>
              );
            })}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-400 tracking-wide uppercase font-mono">
                Today's Habits
              </h2>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg hover:border-zinc-700"
              >
                <Plus
                  size={14}
                  className={`transition-transform duration-400 ${isAdding ? "rotate-45 text-rose-400" : ""}`}
                />
                <span>{isAdding ? "Cancel" : "New Habit"}</span>
              </button>
            </div>
            {/* Add Habit Form */}
            {isAdding && (
              <form onSubmit={addHabit} className="mb-4 animate-fadeIn">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    autoFocus
                    placeHolder="Enter habit name..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 focus:border-zinc-700 focus:outline-none rounded-2xl p-5 text-base text-zinc-200 placeholder-zinc-600 tracking-wide transition-all duration-200 pr-16 "
                  />
                  <button
                    type="submit"
                    className="absolute right-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-4 py-2 rounded-xl font-medium tracking-wide transiton-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="habits-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {habits.map((habit, index) => {
                      const isCompletedOnSelectedDate =
                        habit.completedDays.includes(selectedDate);

                      return (
                        <Draggable
                          key={habit.id}
                          draggableId={String(habit.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps} /* ONLY draggableProps here */
                              style={{
                                ...provided.draggableProps.style,
                                /* Fixes the sticky drop animation */
                                transition: snapshot.isDragging
                                  ? "none"
                                  : provided.draggableProps.style?.transition,
                              }}
                              className={`flex items-center justify-between p-5 rounded-2xl border select-none ${
                                snapshot.isDragging
                                  ? "scale-[1.02] shadow-2xl border-zinc-700 bg-zinc-900/90 backdrop-blur-md"
                                  : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
                              } ${
                                isCompletedOnSelectedDate &&
                                !snapshot.isDragging
                                  ? "bg-zinc-900/20 border-zinc-800/40 opacity-50"
                                  : ""
                              }`}
                            >
                              {/* Left Side: Habit Info */}
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-3 group/title">
                                  {/* === THE FIX: MOVE DRAG HANDLES EXCLUSIVELY TO THE DOTS === */}
                                  <div
                                    {...provided.dragHandleProps} /* Drag handles live HERE now */
                                    className="text-zinc-700 cursor-grab active:cursor-grabbing group-hover/title:text-zinc-500 font-mono text-xs select-none p-1"
                                  >
                                    ⋮⋮
                                  </div>

                                  <h3
                                    className={`text-base font-medium transition-colors duration-300 ${
                                      isCompletedOnSelectedDate
                                        ? "line-through text-zinc-500"
                                        : "text-zinc-200"
                                    }`}
                                  >
                                    {habit.name}
                                  </h3>

                                  <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="text-zinc-600 hover:text-rose-400 opacity-0 group-hover/title:opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-rose-500/5"
                                    title="Delete habit"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                                {habit.streak > 0 && (
                                  <div className="flex items-center gap-1 text-xs font-mono text-amber-500/90 font-medium pl-6">
                                    <Flame
                                      size={13}
                                      fill="currentColor"
                                      className="text-amber-500"
                                    />
                                    <span>{habit.streak} day streak</span>
                                  </div>
                                )}
                              </div>

                              {/* Right Side: Completion Check */}
                              <button
                                onClick={() => toggleHabit(habit.id)}
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                                  isCompletedOnSelectedDate
                                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                                    : "border-zinc-700/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 bg-zinc-900/40"
                                }`}
                              >
                                {isCompletedOnSelectedDate ? (
                                  <Check size={18} strokeWidth={2.5} />
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                )}
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </section>
        </main>

        {/* Right column */}
        <aside className="space-y-8 lg:pt-14">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm flex items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
                Completion
              </h3>
              <p className="text-2xl font-semibold tracking-tight text-zinc-100 mt-1">
                {completionPercentage}%
              </p>
              <p className="text-xs text-zinc-500 font-medium">
                {completedToday} of {habitsToday} completed
              </p>
            </div>

            {/* Ring Graphics */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 80 80"
              >
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-zinc-800/60"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-emerald-400 transition-all duration-500 ease-out"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Award */}
              <div className="absolute text-emerald-400/80">
                <Award size={18} />
              </div>
            </div>
          </div>

          {/* Top Streaks */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
              Best Streaks
            </h3>

            {topStreaks.length > 0 ? (
              <div className="space-y-3.5">
                {topStreaks.map((habit, index) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-zinc-600 w-4">
                        0{index + 1}
                      </span>
                      <span className="text-sm font-medium text-zinc-300 tracking-wide">
                        {habit.name}
                      </span>
                    </div>
                    {/* Badge Indicator */}
                    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-amber-500/90 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
                      <Flame size={12} fill="currentColor" />
                      <span>{habit.streak}d</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 font-medium font-mono">
                No streaks yet.
              </p>
            )}
          </div>
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[320px] bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl backdrop-blur-sm">
              <Calendar
                onChange={handleCalendarChange}
                value={new Date(selectedDate + `, ${new Date().getFullYear()}`)}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
