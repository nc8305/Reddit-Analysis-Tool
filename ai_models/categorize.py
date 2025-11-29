from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch
from scipy.special import expit  # sigmoid function

model_name = "KeroBonito/19-tags-categorize"
THRESHOLD = 0.5  # Threshold cho multi-label classification

# Mapping từ LABEL_X sang tên thực tế (19 labels)
LABEL_MAPPING = {
    "LABEL_0": "arts_&_culture",
    "LABEL_1": "business_&_entrepreneurs",
    "LABEL_2": "celebrity_&_pop_culture",
    "LABEL_3": "diaries_&_daily_life",
    "LABEL_4": "family",
    "LABEL_5": "fashion_&_style",
    "LABEL_6": "film_tv_&_video",
    "LABEL_7": "fitness_&_health",
    "LABEL_8": "food_&_dining",
    "LABEL_9": "gaming",
    "LABEL_10": "learning_&_educational",
    "LABEL_11": "music",
    "LABEL_12": "news_&_social_concern",
    "LABEL_13": "other_hobbies",
    "LABEL_14": "relationships",
    "LABEL_15": "science_&_technology",
    "LABEL_16": "sports",
    "LABEL_17": "travel_&_adventure",
    "LABEL_18": "youth_&_student_life"
}

# Load model và tokenizer (chỉ load 1 lần)

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.eval()


def predict_labels(text, threshold=THRESHOLD, return_list=False):
    """
    Dự đoán labels cho một text
    
    Args:
        text: Text cần phân loại
        threshold: Ngưỡng để chọn labels (default: 0.4)
        return_list: Nếu True, trả về list; nếu False, trả về string
    
    Returns:
        Nếu return_list=True: List các label names
        Nếu return_list=False: String các label names cách nhau bởi dấu phẩy
    """
    # Tokenize
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=256)
    
    # Dự đoán
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits.numpy()[0]
    
    # Chuyển logits thành probabilities (sigmoid cho multi-label)
    probs = expit(logits)
    
    # Lấy predictions với threshold
    preds = (probs >= threshold).astype(int)
    
    # Lấy tên labels từ model config và map sang tên thực tế
    id2label = model.config.id2label
    if id2label:
        # Chuyển đổi keys thành int nếu cần
        if isinstance(list(id2label.keys())[0], str):
            id2label = {int(k): v for k, v in id2label.items()}
        
        # Map từ LABEL_X sang tên thực tế
        predicted_labels = []
        for i, p in enumerate(preds):
            if p == 1:
                label_key = id2label[i]
                # Chuyển LABEL_X sang tên thực tế
                real_label = LABEL_MAPPING.get(label_key, label_key)
                predicted_labels.append(real_label)
        
        if return_list:
            return predicted_labels
        else:
            return ', '.join(predicted_labels) if predicted_labels else 'None'
    else:
        return [] if return_list else 'None'