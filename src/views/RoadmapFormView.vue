<template>
  <div class="roadmap-form">
    <div class="header">
      <h2>{{ isEditing ? 'Edit Roadmap' : 'New Roadmap' }}</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          required
          placeholder="Roadmap title"
          :class="{ error: errors.title }"
        >
        <span v-if="errors.title" class="error-text">{{ errors.title }}</span>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="4"
          placeholder="Roadmap description"
          :class="{ error: errors.description }"
        ></textarea>
        <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
      </div>

      <div class="form-group">
        <label>Topics</label>
        <div class="topics-container">
          <div v-for="(topic, index) in formData.topics" :key="index" class="topic-item">
            <div class="topic-header">
              <h3>Topic {{ index + 1 }}</h3>
              <div class="topic-actions">
                <button type="button" @click="removeTopic(index)" class="btn-danger">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <input
              v-model="topic.title"
              type="text"
              placeholder="Topic title"
              :class="{ error: errors[`topics.${index}.title`] }"
            >
            <textarea
              v-model="topic.description"
              placeholder="Topic description"
              :class="{ error: errors[`topics.${index}.description`] }"
            ></textarea>
            <div class="subtopics-container">
              <div v-for="(subtopic, subtopicIndex) in topic.subtopics" :key="subtopicIndex" class="subtopic-item">
                <input
                  v-model="subtopic.title"
                  type="text"
                  placeholder="Subtopic title"
                  :class="{ error: errors[`topics.${index}.subtopics.${subtopicIndex}.title`] }"
                >
                <textarea
                  v-model="subtopic.description"
                  placeholder="Subtopic description"
                  :class="{ error: errors[`topics.${index}.subtopics.${subtopicIndex}.description`] }"
                ></textarea>
                <button type="button" @click="removeSubtopic(index, subtopicIndex)" class="btn-danger">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <button type="button" @click="addSubtopic(index)" class="btn-secondary">
                <i class="fas fa-plus"></i> Add Subtopic
              </button>
            </div>
          </div>
        </div>
        <button type="button" @click="addTopic" class="btn-secondary">
          <i class="fas fa-plus"></i> Add Topic
        </button>
      </div>

      <div v-if="isEditing" class="form-group">
        <label for="progress">Progress (%)</label>
        <input
          id="progress"
          v-model.number="formData.progress"
          type="number"
          min="0"
          max="100"
          :class="{ error: errors.progress }"
        >
        <span v-if="errors.progress" class="error-text">{{ errors.progress }}</span>
      </div>

      <div class="form-actions">
        <button type="button" @click="$router.back()" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="loader"></span>
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoadmapStore } from '@/stores/roadmap';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const roadmapStore = useRoadmapStore();
const { isLoading } = storeToRefs(roadmapStore);

const isEditing = computed(() => !!route.params.id);
const errors = ref({});

const formData = ref({
  title: '',
  description: '',
  progress: 0,
  topics: []
});

const addTopic = () => {
  formData.value.topics.push({
    title: '',
    description: '',
    subtopics: []
  });
};

const removeTopic = (index) => {
  formData.value.topics.splice(index, 1);
};

const addSubtopic = (topicIndex) => {
  formData.value.topics[topicIndex].subtopics.push({
    title: '',
    description: ''
  });
};

const removeSubtopic = (topicIndex, subtopicIndex) => {
  formData.value.topics[topicIndex].subtopics.splice(subtopicIndex, 1);
};

onMounted(async () => {
  if (isEditing.value) {
    try {
      const roadmap = roadmapStore.roadmaps.find(r => r._id === route.params.id);
      if (roadmap) {
        formData.value = {
          title: roadmap.title,
          description: roadmap.description,
          progress: roadmap.progress,
          topics: roadmap.topics || []
        };
      }
    } catch (err) {
      console.error('Error loading roadmap:', err);
      router.push('/roadmaps');
    }
  }
});

const validateForm = () => {
  const newErrors = {};
  
  if (!formData.value.title.trim()) {
    newErrors.title = 'Title is required';
  }
  
  if (formData.value.progress < 0 || formData.value.progress > 100) {
    newErrors.progress = 'Progress must be between 0 and 100';
  }

  formData.value.topics.forEach((topic, index) => {
    if (!topic.title.trim()) {
      newErrors[`topics.${index}.title`] = 'Topic title is required';
    }
    if (!topic.description.trim()) {
      newErrors[`topics.${index}.description`] = 'Topic description is required';
    }
    
    topic.subtopics.forEach((subtopic, subtopicIndex) => {
      if (!subtopic.title.trim()) {
        newErrors[`topics.${index}.subtopics.${subtopicIndex}.title`] = 'Subtopic title is required';
      }
      if (!subtopic.description.trim()) {
        newErrors[`topics.${index}.subtopics.${subtopicIndex}.description`] = 'Subtopic description is required';
      }
    });
  });
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    if (isEditing.value) {
      await roadmapStore.updateRoadmap(route.params.id, formData.value);
    } else {
      await roadmapStore.createRoadmap(formData.value);
    }
    router.push('/roadmaps');
  } catch (err) {
    console.error('Error submitting form:', err);
  }
};
</script> 