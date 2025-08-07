"""
Model loading and management utilities for ARIMA models.
"""

import json
import pickle
import os
from typing import Dict, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ModelManager:
    """Manager for loading and accessing ARIMA models."""
    
    def __init__(self, index_file: str):
        """
        Initialize ModelManager with path to model index file.
        
        Args:
            index_file: Path to the model_index.json file
        """
        self.index_file = index_file
        self.models: Dict[str, Any] = {}
        self.model_info: Dict[str, Dict] = {}
        self.last_updated: Optional[str] = None
        
    def load_models(self) -> None:
        """Load all models from the index file."""
        try:
            # Read model index
            with open(self.index_file, 'r') as f:
                index_data = json.load(f)
            
            self.last_updated = index_data.get("last_updated")
            models_list = index_data.get("models", [])
            
            if not models_list:
                raise ValueError("No models found in index file")
            
            # Load each model
            base_dir = os.path.dirname(self.index_file)
            loaded_count = 0
            
            for model_data in models_list:
                try:
                    blood_type = model_data["blood_type"]
                    filename = model_data["filename"]
                    
                    # Construct full path
                    model_path = os.path.join(base_dir, filename)
                    
                    if not os.path.exists(model_path):
                        logger.warning(f"Model file not found: {model_path}")
                        continue
                    
                    # Load the pickled model
                    with open(model_path, 'rb') as f:
                        model_data_pickle = pickle.load(f)
                    
                    # Extract the actual model from the dictionary structure
                    if isinstance(model_data_pickle, dict):
                        # Check for common model keys
                        model_keys = ['fitted_model', 'model', 'arima_model', 'sarimax_model']
                        actual_model = None
                        
                        for key in model_keys:
                            if key in model_data_pickle:
                                actual_model = model_data_pickle[key]
                                logger.info(f"Found model in '{key}' key for {blood_type}")
                                break
                        
                        if actual_model is None:
                            logger.warning(f"Could not find model object in pickle for {blood_type}")
                            continue
                        
                        model = actual_model
                    else:
                        # Model is stored directly
                        model = model_data_pickle
                    
                    # Verify the model has forecasting methods
                    if not (hasattr(model, 'forecast') or hasattr(model, 'predict')):
                        logger.warning(f"Model for {blood_type} lacks forecasting methods")
                        continue
                    
                    # Store model and info
                    self.models[blood_type] = model
                    self.model_info[blood_type] = model_data.copy()
                    
                    loaded_count += 1
                    logger.info(f"Loaded model for {blood_type}: {filename}")
                    
                except Exception as e:
                    logger.error(f"Failed to load model {model_data.get('filename', 'unknown')}: {str(e)}")
                    continue
            
            if loaded_count == 0:
                raise ValueError("No models could be loaded successfully")
            
            logger.info(f"Successfully loaded {loaded_count} models")
            
        except FileNotFoundError:
            raise FileNotFoundError(f"Model index file not found: {self.index_file}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in model index file: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Failed to load models: {str(e)}")
    
    def get_model(self, blood_type: str):
        """
        Get a specific model by blood type.
        
        Args:
            blood_type: Blood type identifier (e.g., 'O+', 'A-')
            
        Returns:
            Loaded ARIMA model
            
        Raises:
            ValueError: If blood type not found
        """
        if blood_type not in self.models:
            available = list(self.models.keys())
            raise ValueError(f"Model for blood type '{blood_type}' not found. Available: {available}")
        
        return self.models[blood_type]
    
    def get_model_info(self, blood_type: str) -> Dict[str, Any]:
        """
        Get model information for a specific blood type.
        
        Args:
            blood_type: Blood type identifier
            
        Returns:
            Dictionary with model information
            
        Raises:
            ValueError: If blood type not found
        """
        if blood_type not in self.model_info:
            available = list(self.model_info.keys())
            raise ValueError(f"Model info for blood type '{blood_type}' not found. Available: {available}")
        
        return self.model_info[blood_type]
    
    def get_available_blood_types(self) -> list:
        """Get list of available blood types."""
        return list(self.models.keys())
    
    def is_model_available(self, blood_type: str) -> bool:
        """Check if a model is available for the given blood type."""
        return blood_type in self.models
    
    def get_model_summary(self) -> Dict[str, Any]:
        """Get summary of all loaded models."""
        return {
            "total_models": len(self.models),
            "blood_types": sorted(list(self.models.keys())),
            "last_updated": self.last_updated,
            "models_info": {
                bt: {
                    "filename": info["filename"],
                    "model_type": info["model_type"],
                    "aic": info["aic"],
                    "bic": info["bic"],
                    "training_end_date": info["training_end_date"]
                }
                for bt, info in self.model_info.items()
            }
        }
    
    def validate_models(self) -> Dict[str, Any]:
        """
        Validate all loaded models and return validation results.
        
        Returns:
            Dictionary with validation results
        """
        validation_results = {
            "total_models": len(self.models),
            "valid_models": 0,
            "invalid_models": 0,
            "validation_errors": [],
            "model_status": {}
        }
        
        for blood_type, model in self.models.items():
            try:
                # Basic validation - check if model has required methods
                required_methods = ['forecast', 'predict']
                missing_methods = [method for method in required_methods 
                                 if not hasattr(model, method)]
                
                if missing_methods:
                    error_msg = f"Model {blood_type} missing methods: {missing_methods}"
                    validation_results["validation_errors"].append(error_msg)
                    validation_results["model_status"][blood_type] = "invalid"
                    validation_results["invalid_models"] += 1
                else:
                    validation_results["model_status"][blood_type] = "valid"
                    validation_results["valid_models"] += 1
                    
            except Exception as e:
                error_msg = f"Error validating model {blood_type}: {str(e)}"
                validation_results["validation_errors"].append(error_msg)
                validation_results["model_status"][blood_type] = "error"
                validation_results["invalid_models"] += 1
        
        return validation_results
    
    def reload_models(self) -> None:
        """Reload all models from the index file."""
        logger.info("Reloading models...")
        self.models.clear()
        self.model_info.clear()
        self.load_models()
        logger.info("Models reloaded successfully")