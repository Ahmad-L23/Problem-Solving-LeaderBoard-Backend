const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;
const MONGO_URI = 'mongodb://Ahmad:079589@ac-wezhqss-shard-00-00.ffq6zqq.mongodb.net:27017,ac-wezhqss-shard-00-01.ffq6zqq.mongodb.net:27017,ac-wezhqss-shard-00-02.ffq6zqq.mongodb.net:27017/?ssl=true&replicaSet=atlas-5kt8ku-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0'; // Adjust your connection string if needed

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, default: 0 }
});

const Student = mongoose.model('Student', studentSchema);

// Get all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add new student or update existing one
app.post('/students', async (req, res) => {
  const { id, name, points } = req.body;
  try {
    if (id) {
      // Update
      const updated = await Student.findByIdAndUpdate(id, { name, points }, { new: true });
      res.json(updated);
    } else {
      // Add new or update points if student exists
      const exists = await Student.findOne({ name });
      if (exists) {
        exists.points = points;
        await exists.save();
        return res.json(exists);
      }
      const newStudent = new Student({ name, points });
      await newStudent.save();
      res.json(newStudent);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a student
app.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
