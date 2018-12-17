SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `meeting`
--

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `month` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `weeks` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `participate` tinyint(1) DEFAULT NULL,
  `gender` char(2) DEFAULT NULL,
  `hall` varchar(5) DEFAULT NULL,
  `reading` tinyint(1) DEFAULT NULL,
  `initial_call` tinyint(1) DEFAULT NULL,
  `return_visit` tinyint(1) DEFAULT NULL,
  `study` tinyint(1) DEFAULT NULL,
  `talk` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `student_name` varchar(100) DEFAULT NULL,
  `helper_id` int(11) DEFAULT NULL,
  `helper_name` varchar(100) DEFAULT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `hall` char(2) DEFAULT NULL,
  `task` varchar(50) DEFAULT NULL,
  `week` int(11) DEFAULT NULL,
  `month` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `schedule_id` (`schedule_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;